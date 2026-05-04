"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { actionSaveSettings } from "../actions";
import type { SettingsActionResult } from "../actions";

/**
 * Save button for the Settings form.
 *
 * Uses `useActionState` so the success/error feedback is tied to the action
 * rather than local state — no extra client-side state management needed.
 */
export function SettingsSaveButton() {
  const [state, dispatch, isPending] = useActionState<SettingsActionResult | null, FormData>(
    actionSaveSettings,
    null
  );

  return (
    <div className="rounded-xl border border-border bg-elevated px-6 py-4 space-y-3">
      {state?.success && (
        <div className="flex items-center gap-2 text-xs text-status-success">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Settings saved successfully.
        </div>
      )}
      {state && !state.success && state.error && (
        <div className="flex items-center gap-2 text-xs text-status-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Changes take effect immediately on next install or service restart.
        </p>
        <button
          type="submit"
          formAction={dispatch}
          disabled={isPending}
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
