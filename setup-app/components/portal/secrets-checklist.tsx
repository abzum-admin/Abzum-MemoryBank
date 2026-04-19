"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SecretCheckResult } from "@/lib/secrets/types";

interface SecretsChecklistProps {
  title?: string;
  description?: string;
  results: SecretCheckResult[];
  dopplerProjectHint?: string;  // e.g. "abzum-setup / production"
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-status-success" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function StatusIcon({ status }: { status: SecretCheckResult["result"]["status"] }) {
  switch (status) {
    case "present":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />;
    case "missing":
      return <XCircle className="h-4 w-4 shrink-0 text-status-error" />;
    case "error":
      return <AlertCircle className="h-4 w-4 shrink-0 text-status-warning" />;
    case "unchecked":
    default:
      return <Clock className="h-4 w-4 shrink-0 text-text-muted" />;
  }
}

function StatusLabel({ status }: { status: SecretCheckResult["result"]["status"] }) {
  const map = {
    present:   { label: "Found in Doppler",   cls: "text-status-success" },
    missing:   { label: "Not in Doppler",      cls: "text-status-error" },
    error:     { label: "Check error",         cls: "text-status-warning" },
    unchecked: { label: "Not checked yet",     cls: "text-text-muted" },
  };
  const { label, cls } = map[status] ?? map.unchecked;
  return <span className={cn("text-xs font-medium", cls)}>{label}</span>;
}

function SecretRow({ result }: { result: SecretCheckResult }) {
  const [open, setOpen] = useState(false);
  const { def, result: status } = result;
  const lines = def.howToGet.split("\n").filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        status.status === "present"
          ? "border-status-success/20 bg-status-success/5"
          : status.status === "missing"
          ? "border-status-error/20 bg-status-error/5"
          : "border-border bg-elevated/50"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusIcon status={status.status} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-xs font-semibold text-text-primary bg-surface px-1.5 py-0.5 rounded">
              {def.name}
            </code>
            {!def.required && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
                optional
              </span>
            )}
            <StatusLabel status={status.status} />
          </div>
          <p className="mt-0.5 text-xs text-text-muted truncate">{def.description}</p>
        </div>

        {def.howToGetUrl && (
          <a
            href={def.howToGetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-text-muted hover:text-accent transition-colors"
            title="Open provider dashboard"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted hover:bg-surface hover:text-text-primary transition-colors"
        >
          {open ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Less</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> How to get</>
          )}
        </button>
      </div>

      {/* Expanded instructions */}
      {open && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          <ol className="space-y-2">
            {lines.map((line, i) => {
              // Numbered steps start with digit + dot
              const match = line.match(/^(\d+)\.\s+(.*)/);
              if (match) {
                return (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                      {match[1]}
                    </span>
                    <span className="text-xs text-text-secondary leading-relaxed pt-0.5">
                      {match[2]}
                    </span>
                  </li>
                );
              }
              // Bullet sub-steps
              if (line.startsWith("•")) {
                return (
                  <li key={i} className="ml-8 flex gap-2">
                    <span className="text-accent text-[10px] mt-1">•</span>
                    <span className="text-xs text-text-muted leading-relaxed">{line.slice(1).trim()}</span>
                  </li>
                );
              }
              return (
                <li key={i} className="ml-8 text-xs text-text-muted leading-relaxed">
                  {line}
                </li>
              );
            })}
          </ol>

          {/* Doppler CLI snippet */}
          {def.example && (
            <div className="rounded-lg bg-[#0d1117] border border-border px-4 py-3 font-mono text-[11px] text-text-secondary">
              <p className="text-text-muted mb-1 font-sans text-[10px] uppercase tracking-wider">
                Add to Doppler
              </p>
              <div className="flex items-start gap-2">
                <span className="text-accent select-none">$</span>
                <span className="flex-1 text-text-primary break-all">
                  doppler secrets set {def.name}=
                  <span className="text-text-muted">{def.example}</span>
                </span>
                <CopyButton text={`doppler secrets set ${def.name}=`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SecretsChecklist({
  title = "Required Secrets",
  description,
  results,
  dopplerProjectHint,
}: SecretsChecklistProps) {
  const present = results.filter((r) => r.result.status === "present").length;
  const required = results.filter((r) => r.def.required).length;
  const requiredPresent = results.filter(
    (r) => r.def.required && r.result.status === "present"
  ).length;
  const allRequiredPresent = requiredPresent === required;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
          {dopplerProjectHint && (
            <p className="mt-1 text-[11px] text-text-muted">
              Doppler project:{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-text-primary">
                {dopplerProjectHint}
              </code>
            </p>
          )}
        </div>

        {/* Progress pill */}
        <div
          className={cn(
            "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            allRequiredPresent
              ? "bg-status-success/10 text-status-success"
              : "bg-status-error/10 text-status-error"
          )}
        >
          {allRequiredPresent ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {present} / {results.length} found
        </div>
      </div>

      {/* Secrets list */}
      <div className="space-y-2">
        {results.map((r) => (
          <SecretRow key={r.def.name} result={r} />
        ))}
      </div>

      {/* Help footer */}
      {!allRequiredPresent && (
        <div className="rounded-lg border border-border bg-elevated/40 px-4 py-3">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="font-medium text-text-secondary">Not sure which Doppler project to use?</span>{" "}
            Create a new project in the{" "}
            <a
              href="https://dashboard.doppler.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Doppler dashboard
            </a>{" "}
            and add the secrets above. Then generate a Service Token for that config and
            enter it in the previous step.
          </p>
        </div>
      )}
    </div>
  );
}
