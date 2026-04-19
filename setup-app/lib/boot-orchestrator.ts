import "server-only";
import { composeFilePath } from "@/lib/docker/compose";
import { dopplerComposeUp } from "@/lib/doppler";

/**
 * Boot orchestrator — replaces the systemd oneshot unit.
 *
 * On container startup (called from instrumentation.ts), this module:
 *   1. Opens the SQLite database and runs any pending migrations.
 *   2. Reads all installations where status = "running".
 *   3. Topologically sorts by module dependencies.
 *   4. For each: runs `doppler run -- docker compose up -d --remove-orphans`.
 *      This re-fetches Doppler secrets at boot time, so rotating a secret in
 *      Doppler takes effect on the next container restart — no rebuild needed.
 *   5. Writes an audit log row per service (succeeded / failed).
 *
 * This mirrors the current pattern where each service has a systemd oneshot
 * unit running `doppler run -- docker compose up -d`, but consolidates it into
 * a single orchestrator that respects dependency order.
 *
 * Runs once per process start. Not a daemon loop.
 */

/* ── Types ────────────────────────────────────────────────────────────────── */

interface BootResult {
  instanceId: string;
  moduleId: string;
  status: "ok" | "failed";
  error?: string;
  durationMs: number;
}

/* ── Dependency sort ──────────────────────────────────────────────────────── */

/**
 * Topological sort of installations by module dependencies.
 * Modules with no dependencies come first; dependents come after their deps.
 * Falls back to insertion order for modules not in the registry.
 */
function topoSort(
  installations: Array<{
    instanceId: string;
    moduleId: string;
    dopplerProject: string;
    dopplerConfig: string;
  }>
): typeof installations {
  // Dynamic import to avoid loading the full module registry at top level.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MODULES } = require("@/modules") as {
    MODULES: Record<string, { dependencies?: string[] }>;
  };

  // Build a map of moduleId → dependency moduleIds.
  const deps = new Map<string, string[]>();
  for (const inst of installations) {
    deps.set(inst.instanceId, MODULES[inst.moduleId]?.dependencies ?? []);
  }

  const visited = new Set<string>();
  const sorted: typeof installations = [];

  function visit(instanceId: string) {
    if (visited.has(instanceId)) return;
    visited.add(instanceId);
    const inst = installations.find((i) => i.instanceId === instanceId);
    if (!inst) return;
    // Visit dependencies of the same module type first.
    const depModuleIds = deps.get(instanceId) ?? [];
    for (const depModuleId of depModuleIds) {
      const depInst = installations.find((i) => i.moduleId === depModuleId);
      if (depInst) visit(depInst.instanceId);
    }
    sorted.push(inst);
  }

  for (const inst of installations) {
    visit(inst.instanceId);
  }

  return sorted;
}

/* ── Main orchestrator ────────────────────────────────────────────────────── */

let _ran = false;

/**
 * Run the boot orchestrator. Safe to call multiple times — only executes once
 * per process lifetime (guarded by `_ran`).
 */
export async function runBootOrchestrator(): Promise<void> {
  if (_ran) return;
  _ran = true;

  console.log("[boot-orchestrator] starting");

  // Dynamic imports keep heavy modules (better-sqlite3) out of the cold-start
  // critical path — they're loaded once here.
  let db: Awaited<ReturnType<typeof import("@/lib/db/client")["db"]["transaction"]>> | undefined;

  try {
    const { db: dbClient } = await import("@/lib/db/client");
    const { setupConfig, installations, auditLog } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    // ── 1. Run pending DB migrations ──────────────────────────────────────
    // Drizzle push is used in dev; in production the Dockerfile runs
    // `npx drizzle-kit migrate` before starting the app. We do a lightweight
    // ping here so any migration failure surfaces early.
    try {
      await dbClient.select().from(setupConfig).limit(1);
    } catch (err) {
      console.error("[boot-orchestrator] DB not ready:", err);
      return;
    }

    // ── 2. Read running installations ─────────────────────────────────────
    const running = await dbClient
      .select({
        instanceId: installations.id,
        moduleId: installations.moduleId,
        dopplerProject: installations.dopplerProject,
        dopplerConfig: installations.dopplerConfig,
      })
      .from(installations)
      .where(eq(installations.status, "running"));

    if (running.length === 0) {
      console.log("[boot-orchestrator] no running installations — done");
      return;
    }

    console.log(
      `[boot-orchestrator] bringing up ${running.length} installation(s): ` +
        running.map((r) => r.instanceId).join(", ")
    );

    // ── 3. Topological sort by dependencies ───────────────────────────────
    const sorted = topoSort(running);

    // ── 4. `doppler run -- docker compose up -d` for each ─────────────────
    const results: BootResult[] = [];

    for (const inst of sorted) {
      const start = Date.now();
      const logLines: string[] = [];

      try {
        await dopplerComposeUp({
          project: inst.dopplerProject,
          config: inst.dopplerConfig,
          composeFile: composeFilePath(inst.instanceId),
          instanceId: inst.instanceId,
          onOutput: (line) => {
            logLines.push(line);
            console.log(`[boot-orchestrator] [${inst.instanceId}] ${line}`);
          },
        });

        results.push({
          instanceId: inst.instanceId,
          moduleId: inst.moduleId,
          status: "ok",
          durationMs: Date.now() - start,
        });

        // Write audit log row.
        await dbClient.insert(auditLog).values({
          installationId: inst.instanceId,
          action: "restart",
          status: "succeeded",
          detailsJson: {
            trigger: "boot-orchestrator",
            durationMs: Date.now() - start,
            logLines: logLines.slice(-20), // last 20 lines
          },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `[boot-orchestrator] failed to start ${inst.instanceId}: ${message}`
        );

        results.push({
          instanceId: inst.instanceId,
          moduleId: inst.moduleId,
          status: "failed",
          error: message,
          durationMs: Date.now() - start,
        });

        // Write audit log row.
        await dbClient.insert(auditLog).values({
          installationId: inst.instanceId,
          action: "restart",
          status: "failed",
          detailsJson: {
            trigger: "boot-orchestrator",
            error: message,
            durationMs: Date.now() - start,
            logLines: logLines.slice(-20),
          },
        });
      }
    }

    // ── 5. Summary ────────────────────────────────────────────────────────
    const ok = results.filter((r) => r.status === "ok").length;
    const failed = results.filter((r) => r.status === "failed").length;
    console.log(
      `[boot-orchestrator] done — ${ok} started, ${failed} failed` +
        (failed > 0
          ? " (check logs above for details)"
          : "")
    );

    void db; // suppress unused warning
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[boot-orchestrator] fatal error: ${message}`);
  }
}
