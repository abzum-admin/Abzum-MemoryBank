import Image from "next/image";
import { Key, CloudCog, ShieldCheck, Globe, CheckCircle2 } from "lucide-react";
import { SecretsChecklist } from "@/components/portal/secrets-checklist";
import { SETUP_SECRETS } from "@/lib/secrets/setup-secrets";
import { cn } from "@/lib/utils";
import type { SecretCheckResult } from "@/lib/secrets/types";

/* ── Step definitions ───────────────────────────────────────────────────── */

const STEPS = [
  {
    icon: Key,
    title: "Bootstrap Token",
    description: "One-time token from the install script — verifies you're on the right VPS",
    status: "done" as const,
  },
  {
    icon: CloudCog,
    title: "Doppler Setup",
    description: "Service token for the setup app's own Doppler project",
    status: "current" as const,
  },
  {
    icon: ShieldCheck,
    title: "Secrets Validation",
    description: "Verify all required Cloudflare secrets are present in Doppler",
    status: "upcoming" as const,
  },
  {
    icon: Globe,
    title: "App Domain",
    description: "Provision setup.abzum.cloud via CF tunnel + Access + Google SSO",
    status: "upcoming" as const,
  },
  {
    icon: CheckCircle2,
    title: "Ready",
    description: "Setup app secured — start installing modules",
    status: "upcoming" as const,
  },
];

/* ── Mock secret results for UI preview (Step 9 replaces with live checks) */

const MOCK_RESULTS: SecretCheckResult[] = SETUP_SECRETS.map((def, i) => ({
  def,
  result:
    i < 2
      ? { status: "present" as const }
      : i === 2
      ? { status: "missing" as const }
      : { status: "unchecked" as const },
}));

/* ── Components ─────────────────────────────────────────────────────────── */

type StepStatus = "done" | "current" | "upcoming";

function StepItem({
  step,
  index,
  isLast,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;
  const isDone = step.status === "done";
  const isCurrent = step.status === "current";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-all",
            isDone &&
              "border-status-success/40 bg-status-success/10 text-status-success",
            isCurrent && "border-accent bg-accent/10 text-accent glow-accent",
            !isDone &&
              !isCurrent &&
              "border-border bg-surface text-text-muted"
          )}
        >
          {isDone ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "my-0.5 w-px min-h-[20px] flex-1",
              isDone ? "bg-status-success/25" : "bg-border"
            )}
          />
        )}
      </div>

      <div className="pb-4 pt-0.5 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            isCurrent ? "text-text-primary" : "text-text-muted"
          )}
        >
          {step.title}
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function BootstrapPage() {
  return (
    <div className="flex min-h-screen bg-base bg-gradient-brand">
      {/* ── Left panel — branding + steps ── */}
      <div className="hidden w-80 shrink-0 flex-col justify-between border-r border-border bg-sidebar px-6 py-8 lg:flex">
        {/* Logo */}
        <div className="space-y-8">
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
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Setup steps
            </p>
            {STEPS.map((step, i) => (
              <StepItem
                key={step.title}
                step={step}
                index={i}
                isLast={i === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-elevated/50 p-3">
            <p className="text-[11px] font-medium text-text-secondary">
              Doppler CLI is pre-installed
            </p>
            <p className="mt-1 text-[11px] text-text-muted leading-relaxed">
              The setup app container ships with the Doppler CLI. No separate
              installation needed on the host — just a service token.
            </p>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            After setup, access is secured by Cloudflare Access with Google SSO.
            The bootstrap token is single-use.
          </p>
        </div>
      </div>

      {/* ── Right panel — active step form ── */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto p-8 pt-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
              <Image src="/abzum-logo.svg" alt="Abzum" width={22} height={22} />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              Abzum Setup Console
            </p>
          </div>

          {/* Step header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Step 2 of 5
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">
              Configure Doppler
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              All API tokens are managed by Doppler — this app never stores raw
              secrets. Enter a Doppler Service Token for the project that holds
              your Cloudflare and infrastructure secrets.
            </p>
          </div>

          {/* Doppler token input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-text-primary"
                htmlFor="doppler-token"
              >
                Doppler Service Token
              </label>
              <input
                id="doppler-token"
                type="password"
                placeholder="dp.st.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Starts with{" "}
                  <code className="font-mono">dp.st.</code>
                </p>
                <a
                  href="https://dashboard.doppler.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  Open Doppler dashboard ↗
                </a>
              </div>
            </div>

            {/* How to get a Doppler service token */}
            <div className="rounded-lg border border-border bg-elevated/60 p-4 space-y-2">
              <p className="text-xs font-semibold text-text-primary">
                How to create a Doppler Service Token
              </p>
              <ol className="space-y-1.5">
                {[
                  "Go to dashboard.doppler.com → select your project + config.",
                  'Navigate to "Access" → "Service Tokens" → "Generate".',
                  'Name it (e.g. "abzum-setup-prod") and set expiry (or no expiry).',
                  "Copy the token — it starts with dp.st. and is shown once.",
                  "Paste it above and click Validate.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-text-secondary">
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent mt-px">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              className="flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
            >
              Validate Token & Check Secrets →
            </button>
          </div>

          {/* ── Secrets checklist preview ── */}
          <div className="border-t border-border pt-8">
            <SecretsChecklist
              title="Required Cloudflare Secrets"
              description="These must be present in your Doppler config before the setup app can provision CF tunnel routes and Access apps."
              results={MOCK_RESULTS}
              dopplerProjectHint="abzum-setup / production"
            />
          </div>

          {/* Note about module secrets */}
          <div className="rounded-lg border border-border bg-elevated/40 p-4">
            <p className="text-[11px] text-text-muted leading-relaxed">
              <span className="font-medium text-text-secondary">
                Module-specific secrets (e.g. OPENROUTER_API_KEY for Hermes)
              </span>{" "}
              live in a separate Doppler project scoped to that module. You'll
              configure those in the module's own install wizard — not here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
