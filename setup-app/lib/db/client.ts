import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * SQLite + Drizzle singleton. Path is /opt/abzum-setup-app/data/setup.db in
 * the production container; override with SETUP_DB_PATH for dev/tests.
 *
 * Module-level caching across Next.js hot-reloads: we stash the instance on
 * globalThis so `next dev`'s module graph reloads don't spawn a new SQLite
 * connection per request (which would break WAL and leak fds).
 */
const DB_PATH = process.env.SETUP_DB_PATH ?? "/opt/abzum-setup-app/data/setup.db";

type DbClient = ReturnType<typeof createClient>;

function createClient() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as { _abzumDb?: DbClient };

export const db: DbClient = globalForDb._abzumDb ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb._abzumDb = db;
}

export { schema };
