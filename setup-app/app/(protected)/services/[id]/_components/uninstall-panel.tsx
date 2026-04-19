"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { actionStartUninstall } from "../actions";

interface Props {
  instanceId: string;
  moduleName: string;
  domain: string;
}

/**
 * Uninstall panel — shows a confirmation prompt before starting the uninstall
 * job. Mirrors the "Removal Summary → Confirm" pattern from the bash script.
 *
 * On confirm: calls actionStartUninstall and redirects to the uninstall
 * progress page (reuses the same progress-stream component used by install).
 */
export function UninstallPanel({ instanceId, moduleName, domain }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "confirm">("idle");
  const [removeVolume, setRemoveVolume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await actionStartUninstall(instanceId, removeVolume);
      if (result.success && result.data?.jobId) {
        router.push(`/uninstall/${instanceId}/${result.data.jobId}`);
      } else {
        setError(result.error ?? "Unknown error starting uninstall");
        setPhase("idle");
      }
    });
  }

  if (phase === "idle") {
    return (
      <div className="rounded-xl border border-status-error/20 bg-status-error/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-error" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Uninstall {moduleName}
              </p>
              <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                Removes the containers, CF Access app, tunnel ingress, and DNS record
                for <span className="font-mono">{domain}</span>.
                The compose directory is also deleted from disk.
              </p>
              {error && (
                <p className="mt-2 text-xs text-status-error">{error}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhase("confirm")}
            className="flex shrink-0 h-9 items-center gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-3 text-sm font-medium text-status-error transition-all hover:bg-status-error/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Uninstall
          </button>
        </div>
      </div>
    );
  }

  // Confirmation phase
  const willRemove = [
    `CF Access app: ${domain}`,
    `Tunnel ingress: ${domain}`,
    `DNS CNAME: ${domain}`,
    `Containers: ${instanceId}, ${instanceId}-ui`,
    `Compose directory: /docker/${instanceId}/`,
    removeVolume ? `Volume: ${instanceId}-data (⚠ DATA LOSS)` : `Volume: ${instanceId}-data (kept)`,
  ];

  return (
    <div className="rounded-xl border border-status-error/30 bg-status-error/5 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-status-error" />
        <div>
          <p className="font-semibold text-text-primary">
            Confirm uninstall: {instanceId}
          </p>
          <p className="text-xs text-text-muted">
            This action cannot be undone. The following will be removed:
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {willRemove.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-status-error/60" />
            {item}
          </li>
        ))}
      </ul>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={removeVolume}
          onChange={(e) => setRemoveVolume(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-status-error"
        />
        <span className="text-xs text-text-secondary">
          Also delete the Docker volume ({instanceId}-data).{" "}
          <span className="text-status-error font-medium">
            All stored data will be permanently lost.
          </span>
        </span>
      </label>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => setPhase("idle")}
          disabled={isPending}
          className="flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-all hover:bg-elevated disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-status-error px-4 text-sm font-medium text-white shadow-lg shadow-status-error/20 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting uninstall…
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Confirm Uninstall
            </>
          )}
        </button>
      </div>
    </div>
  );
}
