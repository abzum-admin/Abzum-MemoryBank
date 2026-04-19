import Link from "next/link";
import { Boxes, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { MODULES } from "@/modules/index";

/**
 * Module picker — lists all registered modules and lets the operator choose
 * one to install. Modules already installed once can be installed again as a
 * new instance (e.g. a second Hermes instance for a different user).
 */
export default function InstallPickerPage() {
  const modules = Object.values(MODULES);

  return (
    <div className="flex flex-col">
      <Topbar
        title="Install Module"
        description="Choose a module to deploy on this VPS"
      />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          {modules.length === 0 ? (
            <div className="rounded-xl border border-border bg-elevated/50 px-6 py-12 text-center">
              <Boxes className="mx-auto mb-3 h-8 w-8 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">
                No modules registered
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Add module definitions to <code className="font-mono">modules/</code>{" "}
                and register them in <code className="font-mono">modules/index.ts</code>.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => (
                <Link
                  key={mod.id}
                  href={`/install/${mod.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-elevated/50 px-5 py-4 transition-all hover:border-accent/30 hover:bg-elevated hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                    <Boxes className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {mod.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-text-muted">
                    <span>v{mod.version}</span>
                    <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
