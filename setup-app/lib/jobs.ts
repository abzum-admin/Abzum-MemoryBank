import "server-only";
import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";

/**
 * In-process job runner with SSE pub/sub.
 *
 * Each install / uninstall / restart operation runs as a Job. The job:
 *   1. Holds a list of named Steps with pending/running/succeeded/failed/skipped states.
 *   2. Emits structured JobEvents that the SSE endpoint streams to the browser.
 *   3. Buffers all events so late-connecting clients (page refresh) get full history.
 *
 * Jobs are kept in memory — they survive the lifetime of the Next.js process but
 * not container restarts. That's acceptable: the install result is durable in SQLite;
 * the log stream is only needed during and immediately after the operation.
 *
 * The EventEmitter fan-out lets multiple browser tabs subscribe to the same job.
 */

/* ── Step IDs (install flow) ──────────────────────────────────────────────── */

/**
 * Canonical step IDs for a module install job.
 * Steps are emitted in this order; the browser renders them as a progress list.
 */
export const INSTALL_STEPS = [
  "preflight",
  "doppler-validate",
  "compose-render",
  "image-pull",
  "compose-up",
  "cf-dns",
  "cf-tunnel-route",
  "cf-access-app",
  "cf-access-policy",
  "cf-login-branding",
  "verify",
] as const;

export type InstallStepId = (typeof INSTALL_STEPS)[number];

/** Canonical step IDs for a module uninstall job. */
export const UNINSTALL_STEPS = [
  "preflight",
  "cf-access-app-remove",
  "cf-tunnel-route-remove",
  "cf-dns-remove",
  "compose-down",
  "compose-dir-remove",
] as const;

export type UninstallStepId = (typeof UNINSTALL_STEPS)[number];

/* ── Types ────────────────────────────────────────────────────────────────── */

export type StepStatus = "pending" | "running" | "succeeded" | "failed" | "skipped";
export type JobStatus = "pending" | "running" | "succeeded" | "failed";
export type JobType = "install" | "uninstall" | "restart";

export interface JobStep {
  id: string;
  /** Human-readable label shown in the progress UI. */
  label: string;
  status: StepStatus;
  /** Latest log line or completion message. */
  message?: string;
  startedAt?: number;
  completedAt?: number;
}

export type JobEventType =
  | "step:start"    // step began
  | "step:log"      // log line from step (stdout/stderr)
  | "step:done"     // step completed successfully
  | "step:skip"     // step was intentionally skipped
  | "step:fail"     // step failed (job will fail after this)
  | "job:done"      // entire job succeeded
  | "job:fail";     // entire job failed

export interface JobEvent {
  type: JobEventType;
  stepId?: string;
  message?: string;
  timestamp: number;
  /** Populated on job:done — the public URL of the installed service. */
  publicUrl?: string;
}

export interface Job {
  id: string;
  type: JobType;
  moduleId: string;
  instanceId: string;
  status: JobStatus;
  steps: JobStep[];
  /** All events in emission order — replayed to late-connecting SSE clients. */
  events: JobEvent[];
  startedAt: number;
  completedAt?: number;
  /** Public URL — set when the install job completes successfully. */
  publicUrl?: string;
  /** Error message — set when the job fails. */
  error?: string;
}

/* ── Job context (passed to the job function) ─────────────────────────────── */

/**
 * The interface the job function receives to emit step events.
 * Each method records state on the Job and broadcasts a JobEvent.
 */
export interface JobContext {
  readonly jobId: string;

  /** Mark a step as running (emits step:start). */
  startStep(stepId: string, label?: string): void;

  /** Emit a log line from a running step (emits step:log). */
  log(stepId: string, message: string): void;

  /** Mark a step as succeeded (emits step:done). */
  completeStep(stepId: string, message?: string): void;

  /** Mark a step as skipped (emits step:skip). */
  skipStep(stepId: string, message?: string): void;

  /** Mark a step as failed (emits step:fail). Does NOT automatically fail the job. */
  failStep(stepId: string, message: string): void;

  /** Check if the request has been aborted (client disconnected). */
  readonly aborted: boolean;
}

/* ── In-memory store ──────────────────────────────────────────────────────── */

/** Maximum number of completed jobs to keep in memory (LRU-style). */
const MAX_COMPLETED_JOBS = 50;

const jobStore = new Map<string, Job>();
const jobEmitter = new EventEmitter();
jobEmitter.setMaxListeners(200); // many simultaneous SSE connections are fine

/** Step labels for the install flow. */
const INSTALL_STEP_LABELS: Record<InstallStepId, string> = {
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

/** Step labels for the uninstall flow. */
const UNINSTALL_STEP_LABELS: Record<UninstallStepId, string> = {
  "preflight":                "Pre-flight checks",
  "cf-access-app-remove":    "Remove Access application",
  "cf-tunnel-route-remove":  "Remove tunnel ingress",
  "cf-dns-remove":           "Remove DNS record",
  "compose-down":            "Stop and remove containers",
  "compose-dir-remove":      "Remove compose directory",
};

/* ── Internal helpers ─────────────────────────────────────────────────────── */

function emitEvent(job: Job, event: JobEvent): void {
  job.events.push(event);
  jobEmitter.emit(job.id, event);
}

function getOrCreateStep(job: Job, stepId: string, label?: string): JobStep {
  let step = job.steps.find((s) => s.id === stepId);
  if (!step) {
    step = {
      id: stepId,
      label: label ??
        (INSTALL_STEP_LABELS as Record<string, string>)[stepId] ??
        (UNINSTALL_STEP_LABELS as Record<string, string>)[stepId] ??
        stepId,
      status: "pending",
    };
    job.steps.push(step);
  }
  return step;
}

function evictOldJobs(): void {
  const completed = [...jobStore.values()].filter(
    (j) => j.status === "succeeded" || j.status === "failed"
  );
  // Sort by completion time, oldest first.
  completed.sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));
  while (completed.length > MAX_COMPLETED_JOBS) {
    const oldest = completed.shift()!;
    jobStore.delete(oldest.id);
  }
}

/* ── Public API ───────────────────────────────────────────────────────────── */

/**
 * Look up a job by ID. Returns undefined if not found.
 */
export function getJob(id: string): Job | undefined {
  return jobStore.get(id);
}

/**
 * Create and start a new job.
 *
 * The `jobFn` runs asynchronously — `createJob` returns immediately with the
 * job ID so the caller can redirect to the progress page.
 *
 * Example:
 * ```ts
 * const jobId = createJob({
 *   type: "install",
 *   moduleId: "hermes",
 *   instanceId: "hermes-felix",
 *   steps: INSTALL_STEPS.map(id => ({ id, label: INSTALL_STEP_LABELS[id] })),
 * }, async (ctx) => {
 *   ctx.startStep("preflight");
 *   // ... do work ...
 *   ctx.completeStep("preflight");
 * });
 * ```
 */
export function createJob(
  meta: {
    type: JobType;
    moduleId: string;
    instanceId: string;
    /** Pre-declared steps. Steps can also be created on-the-fly via ctx.startStep(). */
    steps?: Array<{ id: string; label: string }>;
  },
  jobFn: (ctx: JobContext) => Promise<void>
): string {
  const id = randomUUID();
  const now = Date.now();

  // Pre-populate steps from the declared list (all pending).
  const steps: JobStep[] = (meta.steps ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    status: "pending" as StepStatus,
  }));

  const job: Job = {
    id,
    type: meta.type,
    moduleId: meta.moduleId,
    instanceId: meta.instanceId,
    status: "running",
    steps,
    events: [],
    startedAt: now,
  };

  jobStore.set(id, job);

  let aborted = false;

  const ctx: JobContext = {
    jobId: id,

    get aborted() {
      return aborted;
    },

    startStep(stepId, label) {
      const step = getOrCreateStep(job, stepId, label);
      step.status = "running";
      step.startedAt = Date.now();
      emitEvent(job, { type: "step:start", stepId, timestamp: Date.now() });
    },

    log(stepId, message) {
      emitEvent(job, { type: "step:log", stepId, message, timestamp: Date.now() });
    },

    completeStep(stepId, message) {
      const step = getOrCreateStep(job, stepId);
      step.status = "succeeded";
      step.completedAt = Date.now();
      if (message) step.message = message;
      emitEvent(job, { type: "step:done", stepId, message, timestamp: Date.now() });
    },

    skipStep(stepId, message) {
      const step = getOrCreateStep(job, stepId);
      step.status = "skipped";
      step.completedAt = Date.now();
      if (message) step.message = message;
      emitEvent(job, { type: "step:skip", stepId, message, timestamp: Date.now() });
    },

    failStep(stepId, message) {
      const step = getOrCreateStep(job, stepId);
      step.status = "failed";
      step.completedAt = Date.now();
      step.message = message;
      emitEvent(job, { type: "step:fail", stepId, message, timestamp: Date.now() });
    },
  };

  // Run the job function asynchronously.
  (async () => {
    try {
      await jobFn(ctx);
      job.status = "succeeded";
      job.completedAt = Date.now();
      emitEvent(job, {
        type: "job:done",
        publicUrl: job.publicUrl,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      aborted = true;
      const message = err instanceof Error ? err.message : String(err);
      job.status = "failed";
      job.error = message;
      job.completedAt = Date.now();
      emitEvent(job, { type: "job:fail", message, timestamp: Date.now() });
    } finally {
      evictOldJobs();
    }
  })();

  return id;
}

/* ── SSE subscription ─────────────────────────────────────────────────────── */

/**
 * Subscribe to a job's event stream as a web-standard ReadableStream<Uint8Array>.
 *
 * The stream:
 *   1. Replays all events already emitted (full history for late joiners).
 *   2. Streams new events as they arrive.
 *   3. Closes when the job reaches a terminal state (job:done or job:fail).
 *   4. Closes if the `abortSignal` fires (client disconnected).
 *
 * Each chunk is a Server-Sent Events formatted message:
 *   `data: <JSON>\n\n`
 */
export function subscribeToJob(
  jobId: string,
  abortSignal?: AbortSignal
): ReadableStream<Uint8Array> {
  const job = jobStore.get(jobId);
  const encoder = new TextEncoder();

  function sseChunk(event: JobEvent): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
  }

  return new ReadableStream<Uint8Array>({
    start(controller) {
      if (!job) {
        // Unknown job — send an error event and close.
        const errEvent: JobEvent = {
          type: "job:fail",
          message: `Job ${jobId} not found`,
          timestamp: Date.now(),
        };
        controller.enqueue(sseChunk(errEvent));
        controller.close();
        return;
      }

      // 1. Replay all buffered events.
      for (const event of job.events) {
        controller.enqueue(sseChunk(event));
      }

      // 2. If the job is already done, close immediately.
      if (job.status === "succeeded" || job.status === "failed") {
        controller.close();
        return;
      }

      // 3. Subscribe to future events.
      function handleEvent(event: JobEvent) {
        try {
          controller.enqueue(sseChunk(event));
          if (event.type === "job:done" || event.type === "job:fail") {
            cleanup();
            controller.close();
          }
        } catch {
          // Controller may already be closed (client disconnected).
          cleanup();
        }
      }

      function cleanup() {
        jobEmitter.off(jobId, handleEvent);
        abortSignal?.removeEventListener("abort", onAbort);
      }

      function onAbort() {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      }

      jobEmitter.on(jobId, handleEvent);
      abortSignal?.addEventListener("abort", onAbort);
    },
  });
}

/* ── Convenience: pre-built step lists ───────────────────────────────────── */

/** Returns the pre-declared steps for an install job. */
export function installJobSteps(): Array<{ id: string; label: string }> {
  return INSTALL_STEPS.map((id) => ({
    id,
    label: INSTALL_STEP_LABELS[id],
  }));
}

/** Returns the pre-declared steps for an uninstall job. */
export function uninstallJobSteps(): Array<{ id: string; label: string }> {
  return UNINSTALL_STEPS.map((id) => ({
    id,
    label: UNINSTALL_STEP_LABELS[id],
  }));
}
