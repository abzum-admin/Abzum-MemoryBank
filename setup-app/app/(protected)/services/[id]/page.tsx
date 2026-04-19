import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Boxes,
} from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { UninstallPanel } from "./_components/uninstall-panel";
import { LogViewer } from "./_components/log-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Service detail page — shows the installation's config, live container status,
 * recent log tail, and an uninstall panel.
 */
export default async function ServiceDetailPage({ params }: Props) {
  const { id: instanceId } = await params;

  // Load installation from DB.
  let row: {
    id: string;
    moduleId: string;
    moduleVersion: string;
    domain: string;
    dopplerProject: string;
    dopplerConfig: string;
    status: string;
    installedAt: Date;
    lastHealth: string | null;
  } | null = null;

  let moduleName = instanceId;
  let health: "healthy" | "degraded" | "unhealthy" | "unknown" = "unknown";

  try {
    const { getDb } = await import("@/lib/db/client");
    const db = getDb();
    const { installations } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(installations)
      .where(eq(installations.id, instanceId))
      .limit(1);

    if (!rows[0]) notFound();
    row = rows[0];

    const { MODULES } = await import("@/modules/index");
    moduleName = MODULES[row.moduleId]?.name ?? row.moduleId;

    const { containerHealthFromState } = await import("@/lib/docker/compose");
    health = await containerHealthFromState(instanceId);
  } catch {
    notFound();
  }

  if (!row) notFound();

  const publicUrl = row.domain.startsWith("http")
    ? row.domain
    : `https://${row.domain}`;

  const STATUS_COLORS: Record<string, string> = {
    running:     "text-status-success",
    stopped:     "text-text-muted",
    installing:  "text-status-warning",
    failed:      "text-status-error",
    uninstalling:"text-status-warning",
  };

  const HEALTH_COLORS: Record<string, string> = {
    healthy:   "text-status-success",
    degraded:  "text-status-warning",
    unhealthy: "text-status-error",
    unknown:   "text-text-muted",
  };

  return (
    <div className="flex flex-col">
      <Topbar
        title={instanceId}
        description={moduleName}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition-all hover:bg-elevated"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </Topbar>

      <div className="flex-1 p-6 space-y-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* ── Status card ── */}
          <div className="rounded-xl border border-border bg-elevated divide-y divide-border overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <Boxes className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{instanceId}</p>
                <p className="text-xs text-text-muted">{moduleName} v{row.moduleVersion}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium capitalize ${STATUS_COLORS[row.status] ?? "text-text-muted"}`}>
                  {row.status}
                </p>
                <p className={`text-xs ${HEALTH_COLORS[health]}`}>
                  {health.charAt(0).toUpperCase() + health.slice(1)}
                </p>
              </div>
            </div>

            {[
              { label: "Domain", value: row.domain },
              { label: "Doppler project", value: `${row.dopplerProject} / ${row.dopplerConfig}` },
              { label: "Installed", value: row.installedAt.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4 px-5 py-3">
                <span className="w-32 shrink-0 text-xs text-text-muted">{label}</span>
                <span className="font-mono text-xs text-text-primary break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* ── Log viewer ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Container logs
              </h2>
              <form
                action={async () => {
                  "use server";
                  // Reload the page to refresh logs.
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              </form>
            </div>
            <LogViewer instanceId={instanceId} />
          </div>

          {/* ── Uninstall panel ── */}
          <UninstallPanel
            instanceId={instanceId}
            moduleName={moduleName}
            domain={row.domain}
          />
        </div>
      </div>
    </div>
  );
}
