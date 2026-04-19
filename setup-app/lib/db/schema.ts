import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Installations — one row per module instance deployed by this setup app.
 *
 * `id` is the instance slug (e.g. "hermes-felix") and also names the compose
 * directory at /docker/<id>/ and the CF tunnel ingress hostname.
 *
 * `config_json` stores the module-specific TConfig (validated by the module's
 * Zod schema on write). Never contains secrets — those go in doppler_tokens.
 */
export const installations = sqliteTable("installations", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  moduleVersion: text("module_version").notNull(),
  configJson: text("config_json", { mode: "json" }).notNull(),
  domain: text("domain").notNull(),
  status: text("status", {
    enum: ["installing", "running", "stopped", "failed", "uninstalling"],
  }).notNull(),
  installedAt: integer("installed_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
  lastHealthAt: integer("last_health_at", { mode: "timestamp_ms" }),
  lastHealth: text("last_health", { enum: ["healthy", "degraded", "unhealthy", "unknown"] }),
});

/**
 * Cloudflare config — single row (id=1). Holds account/tunnel IDs and the
 * encrypted API token. Updated via the bootstrap wizard or /settings.
 */
export const cloudflareConfig = sqliteTable("cloudflare_config", {
  id: integer("id").primaryKey(),
  accountId: text("account_id").notNull(),
  tunnelId: text("tunnel_id").notNull(),
  authDomain: text("auth_domain"),
  apiTokenEnc: text("api_token_enc").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Doppler service tokens, scoped per installation.
 * One row per installation. Token is encrypted at rest via libsodium.
 */
export const dopplerTokens = sqliteTable("doppler_tokens", {
  installationId: text("installation_id")
    .primaryKey()
    .references(() => installations.id, { onDelete: "cascade" }),
  tokenEnc: text("token_enc").notNull(),
  project: text("project").notNull(),
  config: text("config").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Audit log — append-only record of mutating operations.
 * Installation FK is nullable because bootstrap + CF config changes have no
 * associated installation.
 */
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  installationId: text("installation_id"),
  action: text("action", {
    enum: [
      "install",
      "uninstall",
      "restart",
      "update",
      "adopt",
      "secret_rotate",
      "bootstrap",
      "cf_config_update",
    ],
  }).notNull(),
  status: text("status", { enum: ["started", "succeeded", "failed"] }).notNull(),
  detailsJson: text("details_json", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Generic key-value store for app-level config. Values are encrypted if they
 * carry secrets (bootstrap_token_hash, admin_email stays plain).
 *
 * Known keys:
 *   bootstrap_token_hash  — sha256 of the one-time bootstrap token (plain)
 *   bootstrap_complete    — "1" once wizard finishes (plain)
 *   admin_email           — primary allowed email for CF Access (plain)
 *   app_domain            — setup app's own public domain (plain)
 *   app_version           — last-installed version (plain)
 */
export const setupConfig = sqliteTable("setup_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  encrypted: integer("encrypted", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

export type Installation = typeof installations.$inferSelect;
export type NewInstallation = typeof installations.$inferInsert;
export type CloudflareConfigRow = typeof cloudflareConfig.$inferSelect;
export type DopplerTokenRow = typeof dopplerTokens.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
export type NewAuditLogRow = typeof auditLog.$inferInsert;
export type SetupConfigRow = typeof setupConfig.$inferSelect;
