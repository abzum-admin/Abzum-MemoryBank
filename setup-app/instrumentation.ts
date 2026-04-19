/**
 * Next.js instrumentation hook.
 *
 * This file is loaded once when the Next.js server starts (before any request
 * is served). It is the designated entry point for one-time startup work.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * We use it to run the boot orchestrator, which:
 *   1. Ensures the SQLite DB is reachable.
 *   2. Starts any previously-running module installations via
 *      `doppler run -- docker compose up -d`, refreshing Doppler secrets.
 *
 * The orchestrator is guarded against multiple invocations and runs
 * asynchronously — it does not block the server from accepting requests.
 */
export async function register(): Promise<void> {
  // Only run in the Node.js runtime (not in the Edge runtime).
  // Next.js calls this file in both runtimes when edge middleware is enabled.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Only run in production — in development the hot-reload cycle would
  // trigger this on every save, spamming `docker compose up` calls.
  if (process.env.NODE_ENV !== "production") {
    console.log("[instrumentation] skipping boot orchestrator in development");
    return;
  }

  // Dynamic import so the orchestrator (and its heavy deps: better-sqlite3,
  // dockerode) are not loaded during the build phase.
  const { runBootOrchestrator } = await import("@/lib/boot-orchestrator");

  // Fire-and-forget — errors are caught inside the orchestrator and logged.
  runBootOrchestrator().catch((err: unknown) => {
    console.error("[instrumentation] boot orchestrator threw unexpectedly:", err);
  });
}
