/**
 * Bootstrap state check — reads `bootstrap_complete` from the setup_config
 * SQLite table. Returns true once the first-run wizard has finished.
 *
 * Import is dynamic so this module loads cleanly on Windows dev where
 * better-sqlite3 has no native binding (returns false on DB error).
 */
export async function isBootstrapped(): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db/client");
    const { setupConfig } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({ value: setupConfig.value })
      .from(setupConfig)
      .where(eq(setupConfig.key, "bootstrap_complete"))
      .limit(1);

    return rows[0]?.value === "1";
  } catch {
    return false;
  }
}

/**
 * Returns the CF Access auth domain from the DB, or null if not configured.
 * Used by middleware to know which domain to verify JWTs against.
 */
export async function getCfAuthDomain(): Promise<string | null> {
  try {
    const { db } = await import("@/lib/db/client");
    const { cloudflareConfig } = await import("@/lib/db/schema");

    const rows = await db.select().from(cloudflareConfig).limit(1);
    return rows[0]?.authDomain ?? null;
  } catch {
    return null;
  }
}
