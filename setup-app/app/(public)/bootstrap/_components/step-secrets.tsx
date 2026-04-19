"use client";
import { useActionState } from "react";
import { actionValidateSecrets } from "../actions";
import type { ActionResult } from "../actions";
import { ShieldCheck, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { SecretsChecklist } from "@/components/portal/secrets-checklist";
import { SETUP_SECRETS } from "@/lib/secrets/setup-secrets";
import type { SecretCheckResult } from "@/lib/secrets/types";

export function StepSecrets({
  onSuccess,
  dopplerProjectHint,
}: {
  onSuccess: () => void;
  dopplerProjectHint?: string;
}) {
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const result = await actionValidateSecrets(prev, fd);
      if (result.success) onSuccess();
      return result;
    },
    null
  );

  // Build check results from the action response.
  const presentMap = (state?.data?.["present"] as Record<string, boolean> | undefined) ?? null;

  const results: SecretCheckResult[] = SETUP_SECRETS.map((def) => {
    if (!presentMap) {
      return { def, result: { status: "unchecked" as const } };
    }
    return {
      def,
      result: presentMap[def.name]
        ? { status: "present" as const }
        : { status: "missing" as const },
    };
  });

  const hasChecked = presentMap !== null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 3 of 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          Validate Secrets
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Checking that all required Cloudflare credentials are present in your
          Doppler config. If any are missing, add them and check again.
        </p>
      </div>

      <SecretsChecklist
        title="Required Cloudflare Secrets"
        description="These must be present before the setup app can provision DNS, tunnel routes, and Access apps."
        results={results}
        dopplerProjectHint={dopplerProjectHint}
      />

      {state && !state.success && (
        <div className="flex gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-status-error mt-0.5" />
          <p className="text-xs text-status-error">{state.error}</p>
        </div>
      )}

      <form action={dispatch}>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking secrets…
            </>
          ) : hasChecked ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Re-check Secrets
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Check Secrets Now →
            </>
          )}
        </button>
      </form>
    </div>
  );
}
