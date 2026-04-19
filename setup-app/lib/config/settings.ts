import "server-only";
import { z } from "zod";

/**
 * Typed application settings.
 *
 * All values are stored in the `setup_config` table as plain strings
 * (non-secret — secrets live in Doppler). Each key maps to a `setup_config`
 * row with `key = "settings.<section>.<field>"`.
 *
 * Defaults are used when a key is absent from the DB (i.e. before first
 * save). They are intentionally blank for fields that operators must fill in
 * (domain, emails) so the UI clearly shows "not configured yet".
 */

/* ── Schema ──────────────────────────────────────────────────────────────── */

export const settingsSchema = z.object({
  app: z.object({
    /** Label shown in the sidebar and page titles. */
    name: z.string().default("Abzum"),
    /** The public URL of this setup app, e.g. https://setup.abzum.cloud */
    domain: z.string().default(""),
    /** Comma-separated admin emails — used for CF Access allow-list. */
    adminEmails: z.string().default(""),
  }).default({}),

  cloudflare: z.object({
    /**
     * Default domain suffix appended to instance names for routing.
     * e.g. ".abzum.cloud" → hermes-felix.abzum.cloud
     * Operator sets this once; every module install pre-fills the domain field.
     */
    defaultDomainSuffix: z.string().default(""),
    /**
     * Cloudflare Access auth domain (populated automatically after the
     * first CF Access app is created, e.g. "abzum.cloudflareaccess.com").
     */
    authDomain: z.string().default(""),
  }).default({}),

  doppler: z.object({
    /**
     * Doppler project that holds the setup app's own secrets
     * (CF_API_TOKEN, CF_TUNNEL_ID, etc.).
     */
    setupProject: z.string().default(""),
    /** Doppler config (environment) within that project. */
    setupConfig: z.string().default("production"),
    /**
     * Default Doppler project template for new module installations.
     * Supports the token {module_id}. Leave blank to prompt per install.
     * e.g. "{module_id}" → "hermes" for a Hermes install.
     */
    defaultModuleProjectTemplate: z.string().default(""),
    /** Default Doppler config for new modules. */
    defaultModuleConfig: z.string().default("dev"),
  }).default({}),

  modules: z.object({
    /** Default upstream port used in compose templates. */
    defaultUpstreamPort: z.coerce.number().int().min(1).max(65535).default(9119),
    /**
     * Default compose template name used when none is specified.
     * Must match a file at scripts/templates/<name>.compose.tmpl.
     */
    defaultTemplate: z.string().default("hermes"),
  }).default({}),
});

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsInput = z.input<typeof settingsSchema>;

/* ── Defaults ────────────────────────────────────────────────────────────── */

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

/* ── DB key helpers ──────────────────────────────────────────────────────── */

/** Flatten a Settings object into `setup_config` key-value pairs. */
export function settingsToConfigRows(
  settings: Partial<SettingsInput>
): Array<{ key: string; value: string }> {
  const rows: Array<{ key: string; value: string }> = [];

  function walk(obj: Record<string, unknown>, prefix: string) {
    for (const [k, v] of Object.entries(obj)) {
      const key = `settings.${prefix}${k}`;
      if (v !== null && v !== undefined && typeof v === "object") {
        walk(v as Record<string, unknown>, `${prefix}${k}.`);
      } else {
        rows.push({ key, value: String(v ?? "") });
      }
    }
  }

  walk(settings as Record<string, unknown>, "");
  return rows;
}

/** Reconstruct a Settings object from `setup_config` key-value rows. */
export function settingsFromConfigRows(
  rows: Array<{ key: string; value: string }>
): Settings {
  const obj: Record<string, unknown> = {};

  for (const { key, value } of rows) {
    if (!key.startsWith("settings.")) continue;
    const path = key.slice("settings.".length).split(".");
    let cursor = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]!;
      if (!cursor[segment] || typeof cursor[segment] !== "object") {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Record<string, unknown>;
    }
    cursor[path[path.length - 1]!] = value;
  }

  return settingsSchema.parse(obj);
}

/* ── Server-side reader ──────────────────────────────────────────────────── */

/**
 * Read settings from the DB. Falls back to defaults for any missing keys.
 * Import only in Server Components / Server Actions — uses the DB singleton.
 *
 * Full implementation wired in Step 10 (dashboard) once the DB layer is
 * active in the container. This stub returns defaults so pages compile now.
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Dynamic import keeps the DB client out of the client bundle
    const { db } = await import("@/lib/db/client");
    const { setupConfig } = await import("@/lib/db/schema");
    const { like } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(setupConfig)
      .where(like(setupConfig.key, "settings.%"));

    return settingsFromConfigRows(rows);
  } catch {
    // DB not yet migrated / running in dev without a DB file → use defaults
    return DEFAULT_SETTINGS;
  }
}

/** Persist a partial settings update (upsert each key). */
export async function saveSettings(input: Partial<SettingsInput>): Promise<void> {
  const { db } = await import("@/lib/db/client");
  const { setupConfig } = await import("@/lib/db/schema");

  const rows = settingsToConfigRows(input);
  const now = Date.now();

  for (const { key, value } of rows) {
    await db
      .insert(setupConfig)
      .values({ key, value, updatedAt: new Date(now) })
      .onConflictDoUpdate({
        target: setupConfig.key,
        set: { value, updatedAt: new Date(now) },
      });
  }
}
