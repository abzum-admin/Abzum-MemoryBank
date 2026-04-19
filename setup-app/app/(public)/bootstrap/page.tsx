import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Key,
  CloudCog,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBootstrapState } from "./actions";
import { BootstrapWizard } from "./_components/wizard";

/* ── Step sidebar definition ────────────────────────────────────────────── */

const STEPS = [
  {
    icon: Key,
    title: "Bootstrap Token",
    description: "One-time token from the install script",
    step: 1 as const,
  },
  {
    icon: CloudCog,
    title: "Doppler Setup",
    description: "Service token for infrastructure secrets",
    step: 2 as const,
  },
  {
    icon: ShieldCheck,
    title: "Secrets Validation",
    description: "Verify all required Cloudflare secrets",
    step: 3 as const,
  },
  {
    icon: Globe,
    title: "App Domain",
    description: "Provision setup console via CF tunnel + Access",
    step: 4 as const,
  },
  {
    icon: CheckCircle2,
    title: "Ready",
    description: "Setup secured — start installing modules",
    step: 5 as const,
  },
];

/* ── Step indicator ──────────────────────────────────────────────────────── */

function StepItem({
  step,
  currentStep,
  isLast,
}: {
  step: (typeof STEPS)[number];
  currentStep: number;
  isLast: boolean;
}) {
  const Icon = step.icon;
  const isDone = step.step < currentStep;
  const isCurrent = step.step === currentStep;

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

/* ── Page ────────────────────────────────────────────────────────────────── */

export default async function BootstrapPage() {
  const state = await getBootstrapState();

  // Already bootstrapped — send to the protected app.
  if (state.complete) {
    redirect("/dashboard");
  }

  const dopplerHint =
    state.savedProject && state.savedConfig
      ? `${state.savedProject} / ${state.savedConfig}`
      : undefined;
  void dopplerHint; // used in wizard child

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

          {/* Step indicator — current step driven from DB state */}
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Setup steps
            </p>
            {STEPS.map((s, i) => (
              <StepItem
                key={s.title}
                step={s}
                currentStep={state.currentStep}
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
              installation needed — just a service token.
            </p>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            After setup, access is secured by Cloudflare Access with Google SSO.
            The bootstrap token is single-use.
          </p>
        </div>
      </div>

      {/* ── Right panel — active step ── */}
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

          {/* Client wizard — takes over from here */}
          <BootstrapWizard initial={state} />
        </div>
      </div>
    </div>
  );
}
