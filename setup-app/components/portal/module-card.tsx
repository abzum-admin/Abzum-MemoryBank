"use client";

import Link from "next/link";
import { ExternalLink, MoreHorizontal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
type InstallStatus = "running" | "stopped" | "installing" | "failed" | "uninstalling";

interface ModuleCardProps {
  id: string;
  moduleName: string;
  domain: string;
  status: InstallStatus;
  health?: HealthStatus;
  installedAt?: Date;
}

const STATUS_CONFIG: Record<InstallStatus, { label: string; dot: string; badge: string }> = {
  running:       { label: "Running",      dot: "bg-status-success", badge: "success" },
  stopped:       { label: "Stopped",      dot: "bg-text-muted",     badge: "secondary" },
  installing:    { label: "Installing",   dot: "bg-status-warning",  badge: "warning" },
  failed:        { label: "Failed",       dot: "bg-status-error",    badge: "destructive" },
  uninstalling:  { label: "Removing",     dot: "bg-status-warning",  badge: "warning" },
};

const HEALTH_CONFIG: Record<HealthStatus, { label: string; color: string }> = {
  healthy:   { label: "Healthy",  color: "text-status-success" },
  degraded:  { label: "Degraded", color: "text-status-warning" },
  unhealthy: { label: "Down",     color: "text-status-error" },
  unknown:   { label: "Unknown",  color: "text-text-muted" },
};

export function ModuleCard({
  id,
  moduleName,
  domain,
  status,
  health = "unknown",
  installedAt,
}: ModuleCardProps) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.stopped;
  const h = HEALTH_CONFIG[health] ?? HEALTH_CONFIG.unknown;
  const isPulse = status === "running" || status === "installing";

  return (
    <Link
      href={`/services/${id}`}
      className="group block rounded-xl border border-border bg-elevated p-5 shadow-card transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:-translate-y-[1px]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Module icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
          <Zap className="h-5 w-5 text-accent" />
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {isPulse && (
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75 pulse-dot",
                    s.dot
                  )}
                />
              )}
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
            </span>
            <span className="text-xs text-text-secondary">{s.label}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-semibold text-text-primary">{id}</p>
        <p className="text-xs text-text-muted">{moduleName}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className={cn("text-xs font-medium", h.color)}>{h.label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            window.open(`https://${domain}`, "_blank", "noopener,noreferrer");
          }}
          className="flex items-center gap-1 text-[11px] text-text-muted transition-colors hover:text-accent"
        >
          {domain}
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {installedAt && (
        <p className="mt-2 text-[10px] text-text-muted">
          Installed {installedAt.toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
