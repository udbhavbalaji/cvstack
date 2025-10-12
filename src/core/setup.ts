// External imports
import fs from "node:fs";

// Internal imports
import type { SetupStatus } from "@/types/setup";
import {
  REQUIRED_DIRS,
  ENV_FILEPATH,
  DATABASE_PATH,
  DEFAULT_ENV_CONTENT,
} from "@/consts";
import { createDatabase, runMigrations } from "@/external/db/client";
import { err, ok, Result, ResultAsync } from "neverthrow";
import errors from "./errors";
import log from "./logger";

export function checkSetupStatus(): SetupStatus {
  const directoriesExist = REQUIRED_DIRS.every((dir) => fs.existsSync(dir));
  const envFileExists = fs.existsSync(ENV_FILEPATH);
  const databaseExists = fs.existsSync(DATABASE_PATH);

  // Simple check for migrations - could be more sophisticated
  let migrationsApplied = false;
  if (databaseExists) {
    const dbRes = createDatabase();

    if (dbRes.isOk()) {
      migrationsApplied = true;
    }
  }

  const isFullySetup =
    directoriesExist && envFileExists && databaseExists && migrationsApplied;

  return {
    directoriesExist,
    envFileExists,
    databaseExists,
    migrationsApplied,
    isFullySetup,
  };
}

export async function performSetup() {
  // 1. Create directories
  const dirResult = createDirectories();
  if (dirResult.isErr()) {
    return err(dirResult.error);
  }

  // 2. Create env file if it doesn't exist
  const envResult = await createEnvFile();
  if (envResult.isErr()) {
    return err(envResult.error);
  }

  // 3. Create database
  const dbResult = createDatabase();
  if (dbResult.isErr()) {
    return err(dbResult.error);
  }

  // 4. Run migrations
  const migrationResult = await runMigrations();
  if (migrationResult.isErr()) {
    return err(migrationResult.error);
  }

  return ok();
}

function _createDirectories(dirs: string[]) {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      log.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
      log.info(`✓ Created: ${dir}`);
    }
  }
}

const createDirectories = (dirs: string[] = REQUIRED_DIRS) =>
  Result.fromThrowable(
    () => _createDirectories(dirs),
    (err) => errors.handle.fileError(err, "createDirectories", { dirs }),
  )();

const createEnvFile = () =>
  ResultAsync.fromPromise(
    Bun.write(ENV_FILEPATH, DEFAULT_ENV_CONTENT, { createPath: true }),
    (err) => errors.handle.fileError(err, "createEnvFile"),
  );
