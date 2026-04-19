"use server";

import { revalidatePath } from "next/cache";

export type SettingsActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Save settings from the Settings page form.
 *
 * Form fields are named using dot-notation matching the SettingsSchema shape:
 *   app.name, app.domain, app.adminEmails,
 *   cloudflare.defaultDomainSuffix, cloudflare.authDomain,
 *   doppler.setupProject, doppler.setupConfig,
 *   doppler.defaultModuleProjectTemplate, doppler.defaultModuleConfig,
 *   modules.defaultUpstreamPort, modules.defaultTemplate
 *
 * The action reconstructs the partial settings object from formData and calls
 * saveSettings() which deep-merges over the existing values.
 *
 * All imports are dynamic to avoid better-sqlite3 failure on Windows dev.
 */
export async function actionSaveSettings(
  _prev: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  try {
    const { saveSettings } = await import("@/lib/config/settings");

    // Build a deeply nested partial settings object from flat dot-notation keys.
    const partial: Record<string, Record<string, unknown>> = {};

    formData.forEach((value, key) => {
      const [section, field] = key.split(".");
      if (!section || !field) return;
      if (!partial[section]) partial[section] = {};
      partial[section][field] = String(value).trim();
    });

    // Coerce numeric fields.
    if (partial["modules"]?.["defaultUpstreamPort"]) {
      const raw = partial["modules"]["defaultUpstreamPort"];
      const n = Number(raw);
      if (!isNaN(n) && n > 0) {
        partial["modules"]["defaultUpstreamPort"] = n;
      } else {
        return { success: false, error: "Default upstream port must be a positive number." };
      }
    }

    await saveSettings(partial);

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to save settings: ${msg}` };
  }
}
