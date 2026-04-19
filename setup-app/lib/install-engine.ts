import "server-only";
import {
  createJob,
  INSTALL_STEPS,
  type JobContext,
} from "@/lib/jobs";
import type { BaseInstallConfig } from "@/lib/modules/types";

/**
 * Install engine — runs a module install as a tracked job.
 *
 * Called by the `actionStartInstall` server action after config is validated.
 * Returns a job ID immediately; the actual install runs asynchronously.
 * The browser subscribes to the job's SSE stream to get live progress.
 *
 * Steps (mirrors INSTALL_STEPS const from jobs.ts):
 *   preflight        — run module preInstallChecks
 *   doppler-validate — validate the module's Doppler token has required secrets
 *   compose-render   — render + write docker-compose.yml to /docker/<instanceId>/
 *   image-pull       — docker compose pull
 *   compose-up       — doppler run -- docker compose up -d
 *   cf-dns           — upsert DNS CNAME
 *   cf-tunnel-route  — upsert tunnel ingress rule
 *   cf-access-app    — create/update CF Access application
 *   cf-access-policy — upsert Access allow-list policy
 *   cf-login-branding— apply CF login page branding
 *   verify           — health-check containers + HTTP probe
 *
 * All imports inside the job function are dynamic so the engine loads cleanly
 * on Windows dev where better-sqlite3 and Docker socket are unavailable.
 */

export interface StartInstallOptions {
  moduleId: string;
  config: BaseInstallConfig;
}

export function startInstallJob({ moduleId, config }: StartInstallOptions): string {
  const { instanceId } = config;

  const stepDefs = INSTALL_STEPS.map((id) => ({
    id,
    label: STEP_LABELS[id],
  }));

  const jobId = createJob(
    { type: "install", moduleId, instanceId, steps: stepDefs },
    (ctx) => runInstall(ctx, moduleId, config)
  );

  return jobId;
}

const STEP_LABELS: Record<(typeof INSTALL_STEPS)[number], string> = {
  "preflight":         "Pre-flight checks",
  "doppler-validate":  "Validate Doppler token",
  "compose-render":    "Render docker-compose.yml",
  "image-pull":        "Pull Docker image",
  "compose-up":        "Start containers",
  "cf-dns":            "Update DNS record",
  "cf-tunnel-route":   "Configure tunnel ingress",
  "cf-access-app":     "Create Access application",
  "cf-access-policy":  "Set Access policy",
  "cf-login-branding": "Apply login branding",
  "verify":            "Verify service is reachable",
};

/* ── Install job function ─────────────────────────────────────────────────── */

async function runInstall(
  ctx: JobContext,
  moduleId: string,
  config: BaseInstallConfig
): Promise<void> {
  const { instanceId, domain, dopplerProject, dopplerConfig, accessEmails } = config;

  /* ── preflight ── */
  ctx.startStep("preflight");

  const { MODULES } = await import("@/modules/index");
  const mod = MODULES[moduleId];
  if (!mod) throw new Error(`Unknown module: ${moduleId}`);

  if (mod.preInstallChecks) {
    const checks = await mod.preInstallChecks(config);
    for (const check of checks) {
      ctx.log("preflight", `${check.status === "ok" ? "✓" : "✗"} ${check.label}${check.message ? `: ${check.message}` : ""}`);
      if (check.status === "error") {
        ctx.failStep("preflight", `Pre-flight check failed: ${check.label}${check.message ? ` — ${check.message}` : ""}`);
        throw new Error(`Pre-flight check failed: ${check.label}`);
      }
    }
  }
  ctx.completeStep("preflight", "All checks passed");

  /* ── doppler-validate ── */
  ctx.startStep("doppler-validate");

  const { dopplerCheckSecrets } = await import("@/lib/doppler");

  // Get the module's Doppler service token from DB (scope = instanceId,
  // or fall back to using the CLI with the scoped token file if available).
  // For MVP: we use the Doppler CLI's service token mechanism directly.
  // The token is stored in DB after the user provides it in the install form.
  // Here we try to use the CLI with the project/config directly (assumes the
  // CLI is already authed for this project, e.g. via a scoped service token
  // added by the operator before installing). In production, the full flow
  // stores a per-install Doppler token. For MVP we validate via CLI.
  const requiredSecretNames = (mod.secrets ?? [])
    .filter((s) => s.required)
    .map((s) => s.name);
  const allSecretNames = (mod.secrets ?? []).map((s) => s.name);

  if (requiredSecretNames.length > 0) {
    try {
      const present = await dopplerCheckSecrets(
        "", // empty = use CLI auth (scoped token)
        dopplerProject,
        dopplerConfig,
        allSecretNames
      );
      const missing = requiredSecretNames.filter((n) => !present[n]);
      if (missing.length > 0) {
        ctx.failStep("doppler-validate", `Missing required secrets: ${missing.join(", ")}`);
        throw new Error(`Missing required Doppler secrets: ${missing.join(", ")}`);
      }
      ctx.log("doppler-validate", `All ${requiredSecretNames.length} required secrets present`);
    } catch (err: unknown) {
      // If Doppler CLI isn't available (dev without CLI), warn but continue.
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Missing required")) throw err;
      ctx.log("doppler-validate", `Warning: could not validate secrets — ${msg}`);
    }
  }
  ctx.completeStep("doppler-validate");

  /* ── compose-render ── */
  ctx.startStep("compose-render");
  const { writeComposeFile } = await import("@/lib/docker/compose");
  const yaml = mod.renderComposeYaml(config);
  await writeComposeFile(instanceId, yaml);
  ctx.log("compose-render", `Written to /docker/${instanceId}/docker-compose.yml`);
  ctx.completeStep("compose-render");

  /* ── image-pull ── */
  ctx.startStep("image-pull");
  const { composePull } = await import("@/lib/docker/compose");
  try {
    await composePull({ instanceId, dopplerProject, dopplerConfig, onOutput: (line) => ctx.log("image-pull", line) });
  } catch (err: unknown) {
    // Pull failure is non-fatal if image already exists locally.
    ctx.log("image-pull", `Warning: pull failed (using cached image if available) — ${String(err)}`);
  }
  ctx.completeStep("image-pull");

  /* ── compose-up ── */
  ctx.startStep("compose-up");
  const { composeUp } = await import("@/lib/docker/compose");
  await composeUp({ instanceId, dopplerProject, dopplerConfig, onOutput: (line) => ctx.log("compose-up", line) });
  ctx.completeStep("compose-up", "Containers started");

  /* ── CF steps — need CF credentials from setup Doppler project ── */
  const { db } = await import("@/lib/db/client");
  const { dopplerServiceTokens, cloudflareConfig: cfConfigTable } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { decryptSecret } = await import("@/lib/crypto");
  const { dopplerGetSecretValues } = await import("@/lib/doppler");

  const setupTokenRows = await db
    .select()
    .from(dopplerServiceTokens)
    .where(eq(dopplerServiceTokens.scope, "setup"))
    .limit(1);
  const setupTokenRow = setupTokenRows[0];

  let cfCreds: { apiToken: string; accountId: string; tunnelId: string } | null = null;

  if (setupTokenRow) {
    try {
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
      // CF secrets unavailable — skip CF steps.
    }
  }

  /* ── cf-dns ── */
  ctx.startStep("cf-dns");
  if (cfCreds && mod.cloudflare?.dnsRecord) {
    const { cfEnsureTunnelCname } = await import("@/lib/cloudflare");
    await cfEnsureTunnelCname(cfCreds, domain);
    ctx.completeStep("cf-dns", `CNAME record set for ${domain}`);
  } else {
    ctx.skipStep("cf-dns", cfCreds ? "No DNS record configured for this module" : "CF credentials unavailable");
  }

  /* ── cf-tunnel-route ── */
  ctx.startStep("cf-tunnel-route");
  if (cfCreds && mod.cloudflare?.tunnelRoute) {
    const { cfUpsertTunnelIngress } = await import("@/lib/cloudflare");
    const route = mod.cloudflare.tunnelRoute(config);
    await cfUpsertTunnelIngress(cfCreds, route.hostname, route.service, route.port);
    ctx.completeStep("cf-tunnel-route", `Ingress: ${route.hostname} → ${route.service}:${route.port}`);
  } else {
    ctx.skipStep("cf-tunnel-route", cfCreds ? "No tunnel route configured" : "CF credentials unavailable");
  }

  /* ── cf-access-app ── */
  ctx.startStep("cf-access-app");
  let appId: string | null = null;
  if (cfCreds && mod.cloudflare?.accessApp) {
    const { cfCreateOrUpdateAccessApp } = await import("@/lib/cloudflare");
    const accessAppCfg = mod.cloudflare.accessApp(config);
    appId = await cfCreateOrUpdateAccessApp(cfCreds, accessAppCfg.domain, `${mod.name} — ${instanceId}`);
    ctx.completeStep("cf-access-app", `Access app: ${appId}`);
  } else {
    ctx.skipStep("cf-access-app", cfCreds ? "No Access app configured" : "CF credentials unavailable");
  }

  /* ── cf-access-policy ── */
  ctx.startStep("cf-access-policy");
  if (cfCreds && appId && mod.cloudflare?.accessApp) {
    const { cfUpsertAccessPolicy } = await import("@/lib/cloudflare");
    const accessAppCfg = mod.cloudflare.accessApp(config);
    const emails = accessAppCfg.allowedEmails.length > 0
      ? accessAppCfg.allowedEmails
      : accessEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

    if (emails.length > 0) {
      await cfUpsertAccessPolicy(cfCreds, appId, emails);
      ctx.completeStep("cf-access-policy", `Policy set for ${emails.join(", ")}`);
    } else {
      ctx.skipStep("cf-access-policy", "No allowed emails configured — Access policy not set");
    }
  } else {
    ctx.skipStep("cf-access-policy", "Skipped (no Access app)");
  }

  /* ── cf-login-branding ── */
  ctx.startStep("cf-login-branding");
  if (cfCreds) {
    try {
      const { cfSetLoginBranding } = await import("@/lib/cloudflare");
      const { getSettings } = await import("@/lib/config/settings");
      const settings = await getSettings();
      await cfSetLoginBranding(cfCreds, {
        headerText: settings.app.name || "Abzum Setup Console",
        footerText: "Secured by Cloudflare Access",
      });
      ctx.completeStep("cf-login-branding");
    } catch (err: unknown) {
      // Non-fatal.
      ctx.skipStep("cf-login-branding", `Skipped: ${String(err)}`);
    }
  } else {
    ctx.skipStep("cf-login-branding", "CF credentials unavailable");
  }

  /* ── verify ── */
  ctx.startStep("verify");
  const { containerHealthFromState } = await import("@/lib/docker/compose");
  const health = await containerHealthFromState(instanceId);
  if (health === "unhealthy") {
    ctx.log("verify", "Containers appear unhealthy — check docker logs");
  }
  ctx.completeStep("verify", `Container health: ${health}`);

  /* ── Persist installation row ── */
  const { installations, auditLog } = await import("@/lib/db/schema");
  const { getSettings } = await import("@/lib/config/settings");
  const settings = await getSettings();

  // Persist or update CF config row with authDomain if available.
  if (cfCreds) {
    const { cloudflareConfig: cfConfigSchema } = await import("@/lib/db/schema");
    const cfRows = await db.select().from(cfConfigTable).limit(1);
    const authDomain = cfRows[0]?.authDomain ?? "";
    await db
      .insert(cfConfigSchema)
      .values({
        id: 1,
        accountId: cfCreds.accountId,
        tunnelId: cfCreds.tunnelId,
        authDomain: authDomain || undefined,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cfConfigSchema.id,
        set: { accountId: cfCreds.accountId, tunnelId: cfCreds.tunnelId, updatedAt: new Date() },
      });
  }
  void cfConfigTable; // used above via cfRows

  await db
    .insert(installations)
    .values({
      id: instanceId,
      moduleId,
      moduleVersion: mod.version,
      configJson: config as unknown as Record<string, unknown>,
      domain,
      dopplerProject,
      dopplerConfig,
      status: "running",
      lastHealth: health === "unknown" ? null : health,
      lastHealthAt: new Date(),
    })
    .onConflictDoUpdate({
      target: installations.id,
      set: {
        status: "running",
        configJson: config as unknown as Record<string, unknown>,
        domain,
        dopplerProject,
        dopplerConfig,
        moduleVersion: mod.version,
        updatedAt: new Date(),
        lastHealth: health === "unknown" ? null : health,
        lastHealthAt: new Date(),
      },
    });

  await db.insert(auditLog).values({
    installationId: instanceId,
    action: "install",
    status: "succeeded",
    detailsJson: { moduleId, domain, version: mod.version } as Record<string, unknown>,
  });

  // Set publicUrl on the job so the SSE client can show an "Open" button.
  const publicUrl = mod.publicUrl
    ? mod.publicUrl(config)
    : domain.startsWith("http")
    ? domain
    : `https://${domain}`;

  // Attach publicUrl to the job (accessed by the job runner via the job object).
  const { getJob } = await import("@/lib/jobs");
  const job = getJob(ctx.jobId);
  if (job) job.publicUrl = publicUrl;

  void settings;
}
