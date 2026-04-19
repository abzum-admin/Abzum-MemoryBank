"use client";
import { useActionState } from "react";
import { actionProvisionDomain } from "../actions";
import type { ActionResult } from "../actions";
import { Globe, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

export function StepDomain({
  onSuccess,
  defaultDomain,
}: {
  onSuccess: (domain: string) => void;
  defaultDomain?: string;
}) {
  const [state, dispatch, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev, fd) => {
      const result = await actionProvisionDomain(prev, fd);
      if (result.success && result.data) {
        onSuccess(result.data["domain"] as string);
      }
      return result;
    },
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 4 of 5
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          Secure App Domain
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Provision a public domain for this setup console, secured behind
          Cloudflare Access with Google SSO. After this step you&apos;ll access the
          app via HTTPS with your Google account — no bootstrap token needed again.
        </p>
      </div>

      <form action={dispatch} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary" htmlFor="domain">
            Setup Console Domain
          </label>
          <input
            id="domain"
            name="domain"
            type="text"
            required
            defaultValue={defaultDomain}
            placeholder="setup.yourdomain.com"
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
          <p className="text-xs text-text-muted">
            The subdomain will be created in Cloudflare DNS automatically.
          </p>
        </div>

        {/* What will be provisioned */}
        <div className="rounded-lg border border-border bg-elevated/50 p-4 space-y-2">
          <div className="flex gap-2 items-start">
            <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
            <p className="text-xs font-medium text-text-primary">
              What will be provisioned
            </p>
          </div>
          <ul className="ml-6 space-y-1 text-xs text-text-muted list-disc">
            <li>Cloudflare DNS CNAME → your tunnel</li>
            <li>Tunnel ingress rule → this container on port 3000</li>
            <li>Cloudflare Access app with Google SSO</li>
            <li>Access policy for admin email(s) from Settings</li>
            <li>Login page branding</li>
            <li>Custom &quot;access denied&quot; page</li>
          </ul>
        </div>

        {state && !state.success && (
          <div className="flex gap-2 rounded-lg border border-status-error/30 bg-status-error/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-status-error mt-0.5" />
            <p className="text-xs text-status-error leading-relaxed">{state.error}</p>
          </div>
        )}

        {state?.success && (
          <div className="flex gap-2 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success mt-0.5" />
            <p className="text-xs text-status-success">
              Domain provisioned successfully. DNS propagation may take up to 60 seconds.
            </p>
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
              Provisioning domain…
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Provision Domain →
            </>
          )}
        </button>
      </form>

      <div className="rounded-lg border border-border bg-elevated/40 p-4">
        <p className="text-[11px] text-text-muted leading-relaxed">
          <span className="font-medium text-text-secondary">
            Admin emails for Access policy
          </span>{" "}
          are read from Settings → Application → Admin emails. Make sure you&apos;ve
          configured at least one email there, or the Access app will have no
          allow-list and nobody will be able to log in.
        </p>
      </div>
    </div>
  );
}
