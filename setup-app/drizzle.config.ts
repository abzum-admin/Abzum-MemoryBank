import type { Config } from "drizzle-kit";

/**
 * Drizzle config. Schema and migrations live under lib/db/.
 * Runtime DB path is /opt/abzum-setup-app/data/setup.db in production;
 * for dev/tests, override with SETUP_DB_PATH env var.
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SETUP_DB_PATH ?? "./data/setup.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
