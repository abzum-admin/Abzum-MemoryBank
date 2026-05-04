"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  SkipForward,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStep, JobStatus, JobEvent } from "@/lib/jobs";

interface Props {
  jobId: string;
  moduleId: string;
  moduleName: string;
  instanceId: string;
  initialSteps: JobStep[];
  initialStatus: JobStatus;
  initialPublicUrl?: string;
}

/**
 * Live install progress — connects to the job's SSE endpoint and renders
 * each step's status as it changes. Falls back to the initial server-rendered
 * snapshot if the SSE connection can't be established.
 */
export function ProgressStream({
  jobId,
  moduleId,
  moduleName,
  instanceId,
  initialSteps,
  initialStatus,
  initialPublicUrl,
}: Props) {
  const [steps, setSteps] = useState<JobStep[]>(initialSteps);
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [publicUrl, setPublicUrl] = useState<string | undefined>(initialPublicUrl);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Already finished (server-rendered a completed job).
    if (initialStatus === "succeeded" || initialStatus === "failed") {
      return;
    }

    const es = new EventSource(`/api/jobs/${jobId}/events`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const event: JobEvent = JSON.parse(e.data);
        handleEvent(event);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
      // SSE auto-reconnects — don't close.
    };

    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  function handleEvent(event: JobEvent) {
    switch (event.type) {
      case "step:start":
        setSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId ? { ...s, status: "running", startedAt: event.timestamp } : s
          )
        );
        break;

      case "step:log":
        if (event.stepId && event.message) {
          setLogs((prev) => ({
            ...prev,
            [event.stepId!]: [...(prev[event.stepId!] ?? []), event.message!],
          }));
        }
        break;

      case "step:done":
        setSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "succeeded", message: event.message, completedAt: event.timestamp }
              : s
          )
        );
        break;

      case "step:skip":
        setSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "skipped", message: event.message, completedAt: event.timestamp }
              : s
          )
        );
        break;

      case "step:fail":
        setSteps((prev) =>
          prev.map((s) =>
            s.id === event.stepId
              ? { ...s, status: "failed", message: event.message, completedAt: event.timestamp }
              : s
          )
        );
        break;

      case "job:done":
        setStatus("succeeded");
        if (event.publicUrl) setPublicUrl(event.publicUrl);
        esRef.current?.close();
        break;

      case "job:fail":
        setStatus("failed");
        setError(event.message);
        esRef.current?.close();
        break;
    }
  }

  const isFinished = status === "succeeded" || status === "failed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {status === "running" ? "Installing…" : status === "succeeded" ? "Install Complete" : "Install Failed"}
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          {moduleName}
        </h1>
        <p className="text-sm text-text-secondary">
          Instance:{" "}
          <span className="font-mono text-text-primary">{instanceId}</span>
        </p>
      </div>

      {/* Connection indicator */}
      {!isFinished && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {connected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
              Live updates connected
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-status-warning" />
              Reconnecting…
            </>
          )}
        </div>
      )}

      {/* Step list */}
      <div className="space-y-1">
        {steps.map((step, i) => (
          <StepRow
            key={step.id}
            step={step}
            logs={logs[step.id] ?? []}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>

      {/* Success state */}
      {status === "succeeded" && (
        <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
            <p className="font-medium text-text-primary">
              {moduleName} installed successfully
            </p>
          </div>

          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              {publicUrl}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              href="/dashboard"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href={`/services/${instanceId}`}
              className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
            >
              View service
            </Link>
          </div>
        </div>
      )}

      {/* Failure state */}
      {status === "failed" && (
        <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-status-error" />
            <p className="font-medium text-text-primary">Installation failed</p>
          </div>
          {error && (
            <p className="text-sm text-status-error leading-relaxed">{error}</p>
          )}
          <div className="flex gap-3 pt-1">
            <Link
              href={`/install/${moduleId}`}
              className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
            >
              Try again
            </Link>
            <Link
              href="/dashboard"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step row ─────────────────────────────────────────────────────────────── */

function StepRow({
  step,
  logs,
  isLast,
}: {
  step: JobStep;
  logs: string[];
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLogs = logs.length > 0;

  return (
    <div className="flex gap-3">
      {/* Status icon + connector line */}
      <div className="flex flex-col items-center">
        <StepIcon status={step.status} />
        {!isLast && (
          <div
            className={cn(
              "my-0.5 w-px flex-1 min-h-[12px]",
              step.status === "succeeded" ? "bg-status-success/30" : "bg-border"
            )}
          />
        )}
      </div>

      {/* Step content */}
      <div className="pb-3 pt-0.5 min-w-0 flex-1">
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 text-left",
            hasLogs && "cursor-pointer"
          )}
          onClick={() => hasLogs && setExpanded((e) => !e)}
          disabled={!hasLogs}
        >
          <span
            className={cn(
              "text-sm font-medium",
              step.status === "succeeded" && "text-text-primary",
              step.status === "running" && "text-accent",
              step.status === "failed" && "text-status-error",
              step.status === "skipped" && "text-text-muted",
              step.status === "pending" && "text-text-muted"
            )}
          >
            {step.label}
          </span>
          {step.message && (
            <span className="shrink-0 text-[11px] text-text-muted truncate max-w-[200px]">
              {step.message}
            </span>
          )}
        </button>

        {/* Log lines */}
        {expanded && hasLogs && (
          <div className="mt-2 rounded-lg bg-base border border-border px-3 py-2 max-h-48 overflow-y-auto">
            {logs.map((line, i) => (
              <p key={i} className="font-mono text-[11px] text-text-muted leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: JobStep["status"] }) {
  const base = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full";

  switch (status) {
    case "succeeded":
      return (
        <div className={cn(base, "bg-status-success/10 ring-1 ring-status-success/30")}>
          <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
        </div>
      );
    case "running":
      return (
        <div className={cn(base, "bg-accent/10 ring-1 ring-accent/30")}>
          <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
        </div>
      );
    case "failed":
      return (
        <div className={cn(base, "bg-status-error/10 ring-1 ring-status-error/30")}>
          <XCircle className="h-3.5 w-3.5 text-status-error" />
        </div>
      );
    case "skipped":
      return (
        <div className={cn(base, "bg-surface ring-1 ring-border")}>
          <SkipForward className="h-3 w-3 text-text-muted" />
        </div>
      );
    default:
      return (
        <div className={cn(base, "bg-surface ring-1 ring-border")}>
          <Clock className="h-3 w-3 text-text-muted" />
        </div>
      );
  }
}
