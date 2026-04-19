"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  SkipForward,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStep, JobStatus, JobEvent } from "@/lib/jobs";

interface Props {
  jobId: string;
  instanceId: string;
  initialSteps: JobStep[];
  initialStatus: JobStatus;
}

/**
 * Live uninstall progress — mirrors the install progress-stream but for
 * uninstall jobs. Connects to the same SSE endpoint.
 */
export function UninstallProgressStream({
  jobId,
  instanceId,
  initialSteps,
  initialStatus,
}: Props) {
  const [steps, setSteps] = useState<JobStep[]>(initialSteps);
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [error, setError] = useState<string | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (initialStatus === "succeeded" || initialStatus === "failed") return;

    const es = new EventSource(`/api/jobs/${jobId}/events`);
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      try {
        const event: JobEvent = JSON.parse(e.data);
        switch (event.type) {
          case "step:start":
            setSteps((p) =>
              p.map((s) => s.id === event.stepId ? { ...s, status: "running" } : s)
            );
            break;
          case "step:log":
            if (event.stepId && event.message) {
              setLogs((p) => ({
                ...p,
                [event.stepId!]: [...(p[event.stepId!] ?? []), event.message!],
              }));
            }
            break;
          case "step:done":
            setSteps((p) =>
              p.map((s) =>
                s.id === event.stepId ? { ...s, status: "succeeded", message: event.message } : s
              )
            );
            break;
          case "step:skip":
            setSteps((p) =>
              p.map((s) =>
                s.id === event.stepId ? { ...s, status: "skipped", message: event.message } : s
              )
            );
            break;
          case "step:fail":
            setSteps((p) =>
              p.map((s) =>
                s.id === event.stepId ? { ...s, status: "failed", message: event.message } : s
              )
            );
            break;
          case "job:done":
            setStatus("succeeded");
            es.close();
            break;
          case "job:fail":
            setStatus("failed");
            setError(event.message);
            es.close();
            break;
        }
      } catch {
        // ignore
      }
    };

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const isFinished = status === "succeeded" || status === "failed";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-status-error">
          {status === "running" ? "Uninstalling…" : status === "succeeded" ? "Uninstall Complete" : "Uninstall Failed"}
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">{instanceId}</h1>
        <p className="text-sm text-text-secondary">Removing all associated resources</p>
      </div>

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

      {status === "succeeded" && (
        <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
            <p className="font-medium text-text-primary">
              {instanceId} uninstalled successfully
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex h-9 w-fit items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-status-error" />
            <p className="font-medium text-text-primary">Uninstall failed</p>
          </div>
          {error && <p className="text-sm text-status-error">{error}</p>}
          <Link
            href={`/services/${instanceId}`}
            className="flex h-9 w-fit items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated"
          >
            Back to service
          </Link>
        </div>
      )}
    </div>
  );
}

function StepRow({ step, logs, isLast }: { step: JobStep; logs: string[]; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasLogs = logs.length > 0;

  const icon = () => {
    const base = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full";
    switch (step.status) {
      case "succeeded": return <div className={cn(base, "bg-status-success/10 ring-1 ring-status-success/30")}><CheckCircle2 className="h-3.5 w-3.5 text-status-success" /></div>;
      case "running":   return <div className={cn(base, "bg-accent/10 ring-1 ring-accent/30")}><Loader2 className="h-3.5 w-3.5 text-accent animate-spin" /></div>;
      case "failed":    return <div className={cn(base, "bg-status-error/10 ring-1 ring-status-error/30")}><XCircle className="h-3.5 w-3.5 text-status-error" /></div>;
      case "skipped":   return <div className={cn(base, "bg-surface ring-1 ring-border")}><SkipForward className="h-3 w-3 text-text-muted" /></div>;
      default:          return <div className={cn(base, "bg-surface ring-1 ring-border")}><Clock className="h-3 w-3 text-text-muted" /></div>;
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        {icon()}
        {!isLast && (
          <div className={cn("my-0.5 w-px flex-1 min-h-[12px]", step.status === "succeeded" ? "bg-status-success/30" : "bg-border")} />
        )}
      </div>
      <div className="pb-3 pt-0.5 min-w-0 flex-1">
        <button
          type="button"
          className={cn("flex w-full items-center justify-between gap-2 text-left", hasLogs && "cursor-pointer")}
          onClick={() => hasLogs && setExpanded((e) => !e)}
          disabled={!hasLogs}
        >
          <span className={cn(
            "text-sm font-medium",
            step.status === "succeeded" && "text-text-primary",
            step.status === "running" && "text-accent",
            step.status === "failed" && "text-status-error",
            (step.status === "skipped" || step.status === "pending") && "text-text-muted"
          )}>
            {step.label}
          </span>
          {step.message && (
            <span className="shrink-0 text-[11px] text-text-muted truncate max-w-[200px]">
              {step.message}
            </span>
          )}
        </button>
        {expanded && hasLogs && (
          <div className="mt-2 rounded-lg bg-base border border-border px-3 py-2 max-h-48 overflow-y-auto">
            {logs.map((line, i) => (
              <p key={i} className="font-mono text-[11px] text-text-muted leading-relaxed">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
