import Image from "next/image";
import { Key, Shield, Globe, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Key,
    title: "Bootstrap Token",
    description: "Enter the one-time token printed by the install script",
    status: "current" as const,
  },
  {
    icon: Shield,
    title: "Cloudflare Config",
    description: "Account ID, Tunnel ID, and API token with required scopes",
    status: "upcoming" as const,
  },
  {
    icon: Globe,
    title: "App Domain",
    description: "Provision setup.abzum.cloud via Cloudflare Access with Google SSO",
    status: "upcoming" as const,
  },
  {
    icon: CheckCircle2,
    title: "Ready",
    description: "Setup app secured — start installing modules",
    status: "upcoming" as const,
  },
];

export default function BootstrapPage() {
  return (
    <div className="flex min-h-screen bg-base bg-gradient-brand">
      {/* Left panel — branding */}
      <div className="hidden w-80 shrink-0 flex-col justify-between border-r border-border bg-sidebar p-8 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
            <Image src="/abzum-logo.svg" alt="Abzum" width={22} height={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Abzum</p>
            <p className="text-[11px] text-text-muted">Setup Console</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="space-y-1">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Setup steps
          </p>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isCurrent = step.status === "current";
            const isDone = step.status === "done";
            return (
              <div key={step.title} className="flex gap-3">
                {/* Step line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-all",
                      isDone && "border-status-success bg-status-success/10 text-status-success",
                      isCurrent && "border-accent bg-accent/10 text-accent glow-accent",
                      !isDone && !isCurrent && "border-border bg-surface text-text-muted"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "my-0.5 w-px flex-1 min-h-[20px]",
                        isDone ? "bg-status-success/30" : "bg-border"
                      )}
                    />
                  )}
                </div>

                <div className="pb-4 pt-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-text-primary" : "text-text-muted"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-text-muted">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-text-muted leading-relaxed">
          This wizard only runs once. After setup, the app is secured by Cloudflare
          Access with Google SSO. The bootstrap token expires after first use.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
              <Image src="/abzum-logo.svg" alt="Abzum" width={22} height={22} />
            </div>
            <p className="text-sm font-semibold text-text-primary">Abzum Setup Console</p>
          </div>

          {/* Step header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Step 1 of 4</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">Enter Bootstrap Token</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Copy the token printed by{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-text-primary">
                install-setup-app.sh
              </code>{" "}
              when you ran the one-liner on this VPS.
            </p>
          </div>

          {/* Form — wired in Step 9 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="token">
                Bootstrap Token
              </label>
              <input
                id="token"
                type="text"
                placeholder="abzs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
                readOnly
              />
              <p className="text-xs text-text-muted">
                Starts with <code className="font-mono">abzs_</code> followed by 32 hex characters.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>

          {/* Notice */}
          <div className="rounded-lg border border-border bg-elevated/50 p-4">
            <p className="text-[11px] text-text-muted leading-relaxed">
              <span className="font-medium text-text-secondary">Why a bootstrap token?</span>{" "}
              The setup app is temporarily accessible on your VPS&apos;s public IP before Cloudflare
              Access is configured. The token ensures only you can complete the wizard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
