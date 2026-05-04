/**
 * Run pending migrations. Called automatically by the boot orchestrator on
 * container startup (before serving any requests) and as a CLI via
 * `npm run db:migrate`.
 */
import "server-only";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb } from "./client";

export function runMigrations() {
  const db = getDb();
  migrate(db as unknown as Parameters<typeof migrate>[0], {
    migrationsFolder: "./lib/db/migrations",
  });
}

// Enable direct CLI usage: `npx tsx lib/db/migrate.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log("[db] migrations applied");
}
