import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Installations — one row per module instance deployed by this setup app.
 *
 * `id` is the instance slug (e.g. "hermes-felix") which names:
 *   - the compose dir: /docker/<id>/docker-compose.yml
 *   - the CF tunnel ingress hostname: <domain> → <id>-ui:9119
 *
 * `config_json` stores the module-specific TConfig (validated by the module's
 * Zod schema on write). Never contains secrets — all secrets are in Doppler.
 */
export const installations = sqliteTable("installations", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  moduleVersion: text("module_version").notNull(),
  configJson: text("config_json", { mode: "json" }).notNull(),
  domain: text("domain").notNull(),
  /** Doppler project slug for this installation (e.g. "dev_personal") */
  dopplerProject: text("doppler_project").notNull(),
  /** Doppler config slug for this installation (e.g. "dev") */
  dopplerConfig: text("doppler_config").notNull(),
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
  lastHealth: text("last_health", {
    enum: ["healthy", "degraded", "unhealthy", "unknown"],
  }),
});

/**
 * Cloudflare config — single row (id=1).
 *
 * Stores only non-secret identifiers. CF_API_TOKEN, CF_ACCOUNT_ID,
 * CF_TUNNEL_ID, and CF_ZONE_ID all live in Doppler — this table just records
 * the account and tunnel IDs so the UI can display them without calling
 * Doppler on every page load.
 */
export const cloudflareConfig = sqliteTable("cloudflare_config", {
  id: integer("id").primaryKey(),
  /** Cloudflare account ID (32-char hex). From Doppler: CF_ACCOUNT_ID. */
  accountId: text("account_id").notNull(),
  /** Cloudflare tunnel UUID. From Doppler: CF_TUNNEL_ID. */
  tunnelId: text("tunnel_id").notNull(),
  /** auth_domain from CF Access org (e.g. "abzum.cloudflareaccess.com"). */
  authDomain: text("auth_domain"),
  /** Zone ID for abzum.cloud. From Doppler: CF_ZONE_ID. */
  zoneId: text("zone_id"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Doppler service tokens — one row per scope.
 *
 * `scope` distinguishes different usages:
 *   "setup"        — the setup app's own Doppler project (CF secrets etc.)
 *   "<install-id>" — a module installation's Doppler project
 *
 * Tokens are encrypted at rest with libsodium. Key lives at
 * /etc/abzum-setup-app/secret (written by install-setup-app.sh, mode 0600).
 */
export const dopplerServiceTokens = sqliteTable("doppler_service_tokens", {
  scope: text("scope").primaryKey(),
  tokenEnc: text("token_enc").notNull(),
  /** Doppler project slug (informational — shown in the UI). */
  project: text("project").notNull(),
  /** Doppler config slug (informational). */
  config: text("config").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Audit log — append-only record of every mutating operation.
 *
 * `installationId` is nullable because setup-level actions (bootstrap,
 * CF config update) have no associated installation.
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
      "doppler_token_update",
    ],
  }).notNull(),
  status: text("status", { enum: ["started", "succeeded", "failed"] }).notNull(),
  detailsJson: text("details_json", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/**
 * Generic key-value store for app-level config.
 * All values are plain text. No secrets go here — those are in Doppler or
 * in dopplerServiceTokens (encrypted).
 *
 * Known keys:
 *   bootstrap_token_hash   — blake2b hash of the one-time bootstrap token
 *   bootstrap_complete     — "1" once wizard finishes
 *   admin_email            — primary CF Access allowed email
 *   app_domain             — setup app's public domain (e.g. setup.abzum.cloud)
 *   app_version            — last-installed image version
 */
export const setupConfig = sqliteTable("setup_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
});

/* ── Inferred types ───────────────────────────────────────────────────── */

export type Installation = typeof installations.$inferSelect;
export type NewInstallation = typeof installations.$inferInsert;
export type CloudflareConfigRow = typeof cloudflareConfig.$inferSelect;
export type DopplerServiceToken = typeof dopplerServiceTokens.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
export type NewAuditLogRow = typeof auditLog.$inferInsert;
export type SetupConfigRow = typeof setupConfig.$inferSelect;
