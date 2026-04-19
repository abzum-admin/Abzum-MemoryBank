"use client";
import { useActionState } from "react";
import { actionSaveDopplerToken } from "../actions";
import type { ActionResult } from "../actions";
import { CloudCog, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { SecretsChecklist } from "@/components/portal/secrets-checklist";
import { SETUP_SECRETS } from "@/lib/secrets/setup-secrets";

export function StepDoppler({
  onSuccess,
  defaultProject,
  defaultConfig,
}: {
  onSuccess: (project: string, config: string) => void;
  defaultProject?: string;
  defaultConfig?: string;
}) {
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const result = await actionSaveDopplerToken(prev, fd);
      if (result.success && result.data) {
        onSuccess(
          result.data["project"] as string,
          result.data["config"] as string
        );
      }
      return result;
    },
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 2 of 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          Configure Doppler
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          All API tokens are managed by Doppler — this app never stores raw secrets.
          Enter a Doppler Service Token for the project that holds your Cloudflare
          and infrastructure secrets.
        </p>
      </div>

      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="dp-token">
            Doppler Service Token
          </label>
          <input
            id="dp-token"
            name="token"
            type="password"
            required
            placeholder="dp.st.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Starts with <code className="font-mono">dp.st.</code>
            </p>
            <a
              href="https://dashboard.doppler.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Open Doppler <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="dp-project">
              Doppler Project
            </label>
            <input
              id="dp-project"
              name="project"
              type="text"
              required
              defaultValue={defaultProject}
              placeholder="abzum-setup"
              className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="dp-config">
              Config (Environment)
            </label>
            <input
              id="dp-config"
              name="config"
              type="text"
              required
              defaultValue={defaultConfig ?? "production"}
              placeholder="production"
              className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
        </div>

        {state && !state.success && (
          <div className="flex gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-status-error mt-0.5" />
            <p className="text-xs text-status-error">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating token…
            </>
          ) : (
            <>
              <CloudCog className="h-4 w-4" />
              Validate &amp; Save Token →
            </>
          )}
        </button>
      </form>

      {/* How-to guide */}
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
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent mt-px">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Secrets preview */}
      <div className="border-t border-border pt-6">
        <SecretsChecklist
          title="Required Cloudflare Secrets"
          description="These must be in your Doppler config. The next step will verify them."
          results={SETUP_SECRETS.map((def) => ({ def, result: { status: "unchecked" as const } }))}
        />
      </div>
    </div>
  );
}
