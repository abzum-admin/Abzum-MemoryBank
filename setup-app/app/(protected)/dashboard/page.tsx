import Link from "next/link";
import { PackagePlus, Boxes, Activity, AlertTriangle, Plus } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { StatCard } from "@/components/portal/stat-card";
import { ModuleCard } from "@/components/portal/module-card";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { AdoptBanner } from "./_components/adopt-banner";

/**
 * Dashboard — portal homepage.
 *
 * All data is live: DB query for installations, container health checks via
 * Docker socket, and module list driven from the registry. All imports are
 * dynamic (inside the function body) so the page loads cleanly on Windows dev
 * where better-sqlite3 has no native binding.
 */

/* ── Types ───────────────────────────────────────────────────────────────── */

interface InstallationRow {
  id: string;
  moduleId: string;
  domain: string;
  status: "installing" | "running" | "stopped" | "failed" | "uninstalling";
  installedAt: Date;
  lastHealth: "healthy" | "degraded" | "unhealthy" | "unknown" | null;
}

interface DashboardData {
  installations: Array<InstallationRow & { moduleName: string; health: "healthy" | "degraded" | "unhealthy" | "unknown" }>;
  stats: { total: number; running: number; failed: number; lastDeployLabel: string };
  availableModuleIds: string[];
  adoptableContainers: Array<{ id: string; name: string; imageId: string }>;
}

/* ── Data loading ────────────────────────────────────────────────────────── */

async function getDashboardData(): Promise<DashboardData> {
  const fallback: DashboardData = {
    installations: [],
    stats: { total: 0, running: 0, failed: 0, lastDeployLabel: "—" },
    availableModuleIds: [],
    adoptableContainers: [],
  };

  try {
    const { getDb } = await import("@/lib/db/client");
    const db = getDb();
    const { installations } = await import("@/lib/db/schema");
    const { desc } = await import("drizzle-orm");
    const { containerHealthFromState } = await import("@/lib/docker/compose");
    const { MODULES, MODULE_IDS } = await import("@/modules/index");

    // Load all installations ordered by most-recent first.
    const rows = await db
      .select()
      .from(installations)
      .orderBy(desc(installations.installedAt));

    // Run health checks concurrently — cap at 5s per container (fire-and-forget fallback).
    const healthResults = await Promise.allSettled(
      rows.map((r) =>
        r.status === "running" || r.status === "stopped"
          ? containerHealthFromState(r.id)
          : Promise.resolve<"unknown">("unknown")
      )
    );

    const enriched = rows.map((r, i) => {
      const healthResult = healthResults[i];
      const health: "healthy" | "degraded" | "unhealthy" | "unknown" =
        healthResult?.status === "fulfilled" ? healthResult.value : "unknown";

      return {
        id: r.id,
        moduleId: r.moduleId,
        domain: r.domain,
        status: r.status,
        installedAt: r.installedAt,
        lastHealth: r.lastHealth,
        moduleName: MODULES[r.moduleId]?.name ?? r.moduleId,
        health,
      };
    });

    // Stats derived from enriched data.
    const total = enriched.length;
    const running = enriched.filter((r) => r.status === "running").length;
    const failed = enriched.filter((r) => r.status === "failed").length;

    const latestInstall = enriched[0]?.installedAt ?? null;
    const lastDeployLabel = latestInstall
      ? formatRelativeTime(latestInstall)
      : "—";

    // Adoptable: scan Docker for containers not already tracked in DB.
    const adoptableContainers = await detectAdoptableContainers(
      rows.map((r) => r.id)
    );

    return {
      installations: enriched,
      stats: { total, running, failed, lastDeployLabel },
      availableModuleIds: MODULE_IDS,
      adoptableContainers,
    };
  } catch {
    // DB unavailable (e.g. Windows dev without SQLite binding) — return empty state.
    try {
      const { MODULE_IDS } = await import("@/modules/index");
      return { ...fallback, availableModuleIds: MODULE_IDS };
    } catch {
      return fallback;
    }
  }
}

/**
 * Detect Docker containers that look like module instances but aren't tracked
 * in the installations table. Returns up to 10 candidates.
 */
async function detectAdoptableContainers(
  knownIds: string[]
): Promise<Array<{ id: string; name: string; imageId: string }>> {
  try {
    const Dockerode = (await import("dockerode")).default;
    const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });
    const containers = await docker.listContainers({ all: true });

    const known = new Set(knownIds);
    const candidates = containers
      .filter((c) => {
        // Container name (strip leading /) must not already be tracked.
        const name = (c.Names[0] ?? "").replace(/^\//, "");
        return (
          !known.has(name) &&
          // Only include containers whose image looks like a known module image.
          (c.Image.includes("nousresearch/hermes") ||
            c.Image.includes("cloudflare/cloudflared") ||
            c.Image.includes("paperclip") ||
            c.Image.includes("multica"))
        );
      })
      .slice(0, 10)
      .map((c) => ({
        id: (c.Names[0] ?? "").replace(/^\//, ""),
        name: c.Names[0]?.replace(/^\//, "") ?? c.Id.slice(0, 12),
        imageId: c.Image,
      }));

    return candidates;
  } catch {
    // Docker socket unavailable (Windows dev, missing mount, etc.) — silently skip.
    return [];
  }
}

/* ── Utilities ───────────────────────────────────────────────────────────── */

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const { installations, stats, availableModuleIds, adoptableContainers } =
    await getDashboardData();

  const hasInstallations = installations.length > 0;

  // Available modules = registry modules NOT already installed (any instance).
  const installedModuleIds = new Set(installations.map((i) => i.moduleId));
  const availableToInstall = availableModuleIds.filter(
    (id) => !installedModuleIds.has(id)
  );

  return (
    <div className="flex flex-col">
      <Topbar
        title="Dashboard"
        description="Abzum infrastructure overview"
      >
        <Button asChild size="sm">
          <Link href="/install">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Install Module
          </Link>
        </Button>
      </Topbar>

      <div className="flex-1 space-y-8 p-6">
        {/* ── Adopt banner ── */}
        {adoptableContainers.length > 0 && (
          <AdoptBanner containers={adoptableContainers} />
        )}

        {/* ── Stat cards ── */}
        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Modules installed"
              value={stats.total}
              icon={<Boxes className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Running"
              value={stats.running}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              label="Failed"
              value={stats.failed}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <StatCard
              label="Last deploy"
              value={stats.lastDeployLabel}
              icon={<PackagePlus className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* ── Installed modules grid ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Installed Modules
              </h2>
              <p className="text-xs text-text-muted">
                {stats.total} module{stats.total !== 1 ? "s" : ""} deployed on
                this VPS
              </p>
            </div>
            {hasInstallations && (
              <Button asChild variant="outline" size="sm">
                <Link href="/install">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add
                </Link>
              </Button>
            )}
          </div>

          {hasInstallations ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {installations.map((inst) => (
                <ModuleCard
                  key={inst.id}
                  id={inst.id}
                  moduleName={inst.moduleName}
                  domain={inst.domain}
                  status={inst.status}
                  health={inst.health}
                  installedAt={inst.installedAt}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* ── Available modules (from registry) ── */}
        {availableToInstall.length > 0 && (
          <AvailableModulesSection moduleIds={availableToInstall} />
        )}
      </div>
    </div>
  );
}

/* ── Available modules sub-component ────────────────────────────────────── */

async function AvailableModulesSection({ moduleIds }: { moduleIds: string[] }) {
  const { MODULES } = await import("@/modules/index");

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Available Modules
        </h2>
        <p className="text-xs text-text-muted">Ready to deploy on this VPS</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moduleIds.map((id) => {
          const mod = MODULES[id];
          if (!mod) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-4 rounded-xl border border-border bg-elevated/50 px-4 py-3 transition-all hover:border-border-strong"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-border">
                <Boxes className="h-4 w-4 text-text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {mod.name}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {mod.description}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/install/${id}`}>Install</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
