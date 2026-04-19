"use client";
import { useActionState } from "react";
import { actionVerifyToken } from "../actions";
import type { ActionResult } from "../actions";
import { Key, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function StepToken({ onSuccess }: { onSuccess: () => void }) {
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const result = await actionVerifyToken(prev, fd);
      if (result.success) onSuccess();
      return result;
    },
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 1 of 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          Enter Bootstrap Token
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          The one-time token was printed to your terminal when{" "}
          <code className="font-mono text-xs bg-elevated px-1 py-0.5 rounded">
            install-setup-app.sh
          </code>{" "}
          ran. It starts with{" "}
          <code className="font-mono text-xs">abzs_</code>.
        </p>
      </div>

      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="token">
            Bootstrap Token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            required
            placeholder="abzs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
          <p className="text-xs text-text-muted">
            Single-use — invalidated immediately after verification.
          </p>
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
              Verifying…
            </>
          ) : (
            <>
              <Key className="h-4 w-4" />
              Verify Token
            </>
          )}
        </button>
      </form>

      <div className="rounded-lg border border-border bg-elevated/40 p-4">
        <p className="text-[11px] text-text-muted leading-relaxed">
          <span className="font-medium text-text-secondary">Can't find your token?</span>{" "}
          SSH into the VPS and run:{" "}
          <code className="font-mono text-xs">
            cat /opt/abzum-setup-app/bootstrap-token
          </code>
          <br />
          The token is only stored there during the bootstrap window and is deleted
          once verified.
        </p>
      </div>
    </div>
  );
}
