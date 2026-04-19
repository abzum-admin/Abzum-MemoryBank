"use client";
import { useTransition } from "react";
import { actionCompleteBootstrap } from "../actions";
import { CheckCircle2, ArrowRight, Loader2, ExternalLink } from "lucide-react";

export function StepReady({ domain }: { domain?: string }) {
  const [isPending, startTransition] = useTransition();

  function handleFinish() {
    startTransition(async () => {
      await actionCompleteBootstrap();
    });
  }

  const publicUrl = domain ? `https://${domain}` : null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 5 of 5
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-success/10 ring-1 ring-status-success/30">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Setup Complete
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Your Abzum Setup Console is fully configured and secured.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        {[
          { label: "Bootstrap token", detail: "Verified and invalidated" },
          { label: "Doppler integration", detail: "Service token saved (encrypted)" },
          { label: "Cloudflare secrets", detail: "All required secrets present" },
          {
            label: "App domain",
            detail: publicUrl ?? "Provisioned with CF Access + Google SSO",
          },
        ].map(({ label, detail }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg border border-border bg-elevated/50 px-4 py-2.5"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-muted truncate">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {publicUrl && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4 space-y-1">
          <p className="text-xs font-medium text-text-secondary">
            Your setup console is now accessible at:
          </p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            {publicUrl}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-xs text-text-muted">
            DNS propagation may take up to 60 seconds. Log in with the Google
            account that matches your admin email.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleFinish}
        disabled={isPending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Finishing…
          </>
        ) : (
          <>
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
