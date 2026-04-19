import Link from "next/link";
import { PackagePlus, Boxes, Activity, CheckCircle2, Plus } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { StatCard } from "@/components/portal/stat-card";
import { ModuleCard } from "@/components/portal/module-card";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Dashboard — portal homepage.
 * Shows stat overview cards + installed module grid.
 *
 * Currently rendered with mock data so the layout and visual design can be
 * reviewed and iterated on. Live data wiring happens in Step 10 once the DB
 * layer and module engine are in place.
 */

// Mock data for UI preview — replaced with DB queries in Step 10
const MOCK_INSTALLATIONS = [
  {
    id: "hermes-felix",
    moduleName: "Hermes Agent",
    domain: "hermes-felix.abzum.cloud",
    status: "running" as const,
    health: "healthy" as const,
    installedAt: new Date("2026-04-15"),
  },
];

const MOCK_STATS = {
  total: 1,
  running: 1,
  failed: 0,
  lastDeploy: "2 days ago",
};

export default function DashboardPage() {
  const hasInstallations = MOCK_INSTALLATIONS.length > 0;

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
        {/* ── Stat cards ── */}
        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Modules installed"
              value={MOCK_STATS.total}
              icon={<Boxes className="h-4 w-4" />}
              accent
            />
            <StatCard
              label="Running"
              value={MOCK_STATS.running}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatCard
              label="Failed"
              value={MOCK_STATS.failed}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              label="Last deploy"
              value={MOCK_STATS.lastDeploy}
              icon={<PackagePlus className="h-4 w-4" />}
            />
          </div>
        </section>

        {/* ── Module grid ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Installed Modules</h2>
              <p className="text-xs text-text-muted">
                {MOCK_STATS.total} module{MOCK_STATS.total !== 1 ? "s" : ""} deployed on this VPS
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
              {MOCK_INSTALLATIONS.map((inst) => (
                <ModuleCard key={inst.id} {...inst} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* ── Available modules (coming soon) ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Available Modules</h2>
            <p className="text-xs text-text-muted">Ready to deploy on this VPS</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "hermes",    name: "Hermes Agent",  desc: "AI agent + dashboard",   available: true },
              { id: "cloudflared", name: "cloudflared", desc: "Zero Trust tunnel",       available: false },
              { id: "paperclip", name: "Paperclip",     desc: "Document processing",     available: false },
              { id: "multica",   name: "multica.ai",    desc: "AI orchestration",        available: false },
            ].map((mod) => (
              <div
                key={mod.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-elevated/50 px-4 py-3 transition-all hover:border-border-strong"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-border">
                  <Boxes className="h-4 w-4 text-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{mod.name}</p>
                  <p className="truncate text-xs text-text-muted">{mod.desc}</p>
                </div>
                {mod.available ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/install/${mod.id}`}>Install</Link>
                  </Button>
                ) : (
                  <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
