// External imports
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { generateMigrations } from "@/external/shell";
import { err, ok, Result } from "neverthrow";
import path from "node:path";
import fs from "node:fs";

// Internal imports
import * as schema from "@/external/db/schema";
import { DATABASE_PATH, MIGRATIONS_DIR } from "@/consts";
import errors from "@/core/errors";
import { unwrap } from "@/core/unwrap";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function _createDatabase() {
  // todo: add logger option after setting up env
  const database = drizzle(DATABASE_PATH, { schema });
  db = database;
  return database;
}

const createDatabase = Result.fromThrowable(_createDatabase, (err) =>
  errors.handle.databaseError(err, "createDatabase"),
);

function getDatabase() {
  if (!db) {
    return createDatabase();
  }
  return ok(db);
}

function runMigrations() {
  const dbRes = getDatabase();

  if (dbRes.isErr()) {
    return err(dbRes.error);
  }

  migrate(dbRes.value, { migrationsFolder: MIGRATIONS_DIR });

  return ok();
}

// async function generateMigrations() {
//   const projectRoot = path.resolve(import.meta.dir, "../..");
//
//   const config = {
//     schema: path.join(projectRoot, "src", "external", "db", "schema.ts"),
//     out: MIGRATIONS_DIR,
//     dialect: "sqlite",
//     dbCredentials: {
//       url: DATABASE_PATH,
//     },
//   } as const;
//
//   console.log("🧩 Generating migrations...");
//   await generate(config);
//   console.log("✅ Migrations generated in", config.out);
// }

export { createDatabase, getDatabase, runMigrations };
