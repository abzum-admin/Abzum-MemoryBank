import "server-only";
import {
  createJob,
  UNINSTALL_STEPS,
  type JobContext,
} from "@/lib/jobs";

/**
 * Uninstall engine — removes a module installation as a tracked job.
 *
 * Steps (mirrors UNINSTALL_STEPS from jobs.ts):
 *   preflight              — verify installation exists in DB
 *   cf-access-app-remove   — delete CF Access application
 *   cf-tunnel-route-remove — remove tunnel ingress rule
 *   cf-dns-remove          — remove DNS CNAME record
 *   compose-down           — docker compose down (with volume removal)
 *   compose-dir-remove     — remove /docker/<instanceId>/ from disk
 *
 * After the job succeeds the installation row is deleted from SQLite and an
 * audit log entry is written.
 */

export interface StartUninstallOptions {
  instanceId: string;
  /** Whether to remove the named Docker volume (default false). */
  removeVolume?: boolean;
}

export function startUninstallJob({ instanceId, removeVolume = false }: StartUninstallOptions): string {
  const stepDefs = UNINSTALL_STEPS.map((id) => ({
    id,
    label: STEP_LABELS[id],
  }));

  const jobId = createJob(
    { type: "uninstall", moduleId: "", instanceId, steps: stepDefs },
    (ctx) => runUninstall(ctx, instanceId, removeVolume)
  );

  return jobId;
}

const STEP_LABELS: Record<(typeof UNINSTALL_STEPS)[number], string> = {
  "preflight":               "Pre-flight checks",
  "cf-access-app-remove":    "Remove Access application",
  "cf-tunnel-route-remove":  "Remove tunnel ingress",
  "cf-dns-remove":           "Remove DNS record",
  "compose-down":            "Stop and remove containers",
  "compose-dir-remove":      "Remove compose directory",
};

/* ── Uninstall job function ───────────────────────────────────────────────── */

async function runUninstall(
  ctx: JobContext,
  instanceId: string,
  removeVolume: boolean
): Promise<void> {
  /* ── preflight ── */
  ctx.startStep("preflight");

  const { getDb } = await import("@/lib/db/client");
  const db = getDb();
  const { installations, dopplerServiceTokens, cloudflareConfig: cfConfigTable } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const rows = await db
    .select()
    .from(installations)
    .where(eq(installations.id, instanceId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    ctx.failStep("preflight", `Installation "${instanceId}" not found in database`);
    throw new Error(`Installation "${instanceId}" not found`);
  }

  ctx.log("preflight", `Found installation: ${row.moduleId} @ ${row.domain}`);

  // Mark installation as uninstalling.
  await db
    .update(installations)
    .set({ status: "uninstalling", updatedAt: new Date() })
    .where(eq(installations.id, instanceId));

  ctx.completeStep("preflight");

  /* ── Get CF credentials ── */
  const setupTokenRows = await db
    .select()
    .from(dopplerServiceTokens)
    .where(eq(dopplerServiceTokens.scope, "setup"))
    .limit(1);
  const setupTokenRow = setupTokenRows[0];

  let cfCreds: { apiToken: string; accountId: string; tunnelId: string } | null = null;
  const cfRows = await db.select().from(cfConfigTable).limit(1);
  const cfRow = cfRows[0];

  if (setupTokenRow && cfRow) {
    try {
      const { decryptSecret } = await import("@/lib/crypto");
      const { dopplerGetSecretValues } = await import("@/lib/doppler");
      const setupToken = await decryptSecret(setupTokenRow.tokenEnc);
      const cfSecrets = await dopplerGetSecretValues(
        setupToken,
        setupTokenRow.project,
        setupTokenRow.config,
        ["CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_TUNNEL_ID"]
      );
      if (cfSecrets.CF_API_TOKEN && cfSecrets.CF_ACCOUNT_ID && cfSecrets.CF_TUNNEL_ID) {
        cfCreds = {
          apiToken: cfSecrets.CF_API_TOKEN,
          accountId: cfSecrets.CF_ACCOUNT_ID,
          tunnelId: cfSecrets.CF_TUNNEL_ID,
        };
      }
    } catch {
      // Non-fatal — continue without CF cleanup.
    }
  }

  /* ── cf-access-app-remove ── */
  ctx.startStep("cf-access-app-remove");
  if (cfCreds) {
    try {
      const { cfDeleteAccessApp } = await import("@/lib/cloudflare");
      await cfDeleteAccessApp(cfCreds, row.domain);
      ctx.completeStep("cf-access-app-remove", `Removed Access app for ${row.domain}`);
    } catch (err: unknown) {
      ctx.skipStep("cf-access-app-remove", `Skipped: ${String(err)}`);
    }
  } else {
    ctx.skipStep("cf-access-app-remove", "CF credentials unavailable");
  }

  /* ── cf-tunnel-route-remove ── */
  ctx.startStep("cf-tunnel-route-remove");
  if (cfCreds) {
    try {
      const { cfRemoveTunnelIngress } = await import("@/lib/cloudflare");
      await cfRemoveTunnelIngress(cfCreds, row.domain);
      ctx.completeStep("cf-tunnel-route-remove", `Removed ingress for ${row.domain}`);
    } catch (err: unknown) {
      ctx.skipStep("cf-tunnel-route-remove", `Skipped: ${String(err)}`);
    }
  } else {
    ctx.skipStep("cf-tunnel-route-remove", "CF credentials unavailable");
  }

  /* ── cf-dns-remove ── */
  ctx.startStep("cf-dns-remove");
  if (cfCreds) {
    try {
      const { cfRemoveDnsRecord } = await import("@/lib/cloudflare");
      await cfRemoveDnsRecord(cfCreds, row.domain);
      ctx.completeStep("cf-dns-remove", `Removed CNAME for ${row.domain}`);
    } catch (err: unknown) {
      ctx.skipStep("cf-dns-remove", `Skipped: ${String(err)}`);
    }
  } else {
    ctx.skipStep("cf-dns-remove", "CF credentials unavailable");
  }

  /* ── compose-down ── */
  ctx.startStep("compose-down");
  const { composeDown } = await import("@/lib/docker/compose");
  try {
    await composeDown({
      instanceId,
      dopplerProject: row.dopplerProject,
      dopplerConfig: row.dopplerConfig,
      removeVolumes: removeVolume,
      onOutput: (line) => ctx.log("compose-down", line),
    });
    ctx.completeStep("compose-down", "Containers stopped and removed");
  } catch (err: unknown) {
    // Non-fatal: containers might already be stopped.
    ctx.log("compose-down", `Warning: ${String(err)}`);
    ctx.completeStep("compose-down", "Completed with warnings (containers may have already been removed)");
  }

  /* ── compose-dir-remove ── */
  ctx.startStep("compose-dir-remove");
  const { removeComposeDir } = await import("@/lib/docker/compose");
  try {
    await removeComposeDir(instanceId);
    ctx.completeStep("compose-dir-remove", `/docker/${instanceId}/ removed`);
  } catch (err: unknown) {
    ctx.skipStep("compose-dir-remove", `Skipped: ${String(err)}`);
  }

  /* ── Delete DB row + audit log ── */
  const { auditLog } = await import("@/lib/db/schema");

  await db.delete(installations).where(eq(installations.id, instanceId));

  await db.insert(auditLog).values({
    installationId: instanceId,
    action: "uninstall",
    status: "succeeded",
    detailsJson: { domain: row.domain, moduleId: row.moduleId } as Record<string, unknown>,
  });
}
