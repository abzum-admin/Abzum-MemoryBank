import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * SQLite + Drizzle lazy singleton.
 *
 * Path is /opt/abzum-setup-app/data/setup.db in the production container;
 * override with SETUP_DB_PATH for dev/tests.
 *
 * better-sqlite3 is require()'d inside createClient() — never at module load
 * time — so this module can be imported on Windows dev machines where the
 * native binding hasn't been compiled. The DB is only opened on the first
 * actual query.
 *
 * Stashed on globalThis so next dev hot-reloads don't spawn a new connection
 * per request (which would break WAL and leak fds).
 */

const DB_PATH = process.env.SETUP_DB_PATH ?? "/opt/abzum-setup-app/data/setup.db";

type DbClient = ReturnType<typeof createClient>;

function createClient() {
  // require() keeps the native binding out of the module evaluation critical
  // path — it's resolved only when the DB is first accessed at runtime.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3") as typeof import("better-sqlite3").default;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as { _abzumDb?: DbClient };

/**
 * Return (or lazily create) the singleton DB client.
 *
 * All call sites: `const { getDb } = await import("@/lib/db/client"); const db = getDb();`
 */
export function getDb(): DbClient {
  if (!globalForDb._abzumDb) {
    globalForDb._abzumDb = createClient();
  }
  return globalForDb._abzumDb;
}

export { schema };
