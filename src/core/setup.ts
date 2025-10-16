// External imports
import fs from "node:fs";

// Internal imports
import type { SetupStatus } from "@/types/setup";
import {
  REQUIRED_DIRS,
  ENV_FILEPATH,
  DATABASE_PATH,
  DEFAULT_ENV_CONTENT,
  SETUP_COMPLETE_FILEPATH,
} from "@/consts";
import { createDatabase, runMigrations } from "@/external/db/client";
import { err, ok } from "neverthrow";
import { createDirectories, writeFile } from "./file";
import yoctoSpinner from "yocto-spinner";

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
  const mainSpinner = yoctoSpinner({
    color: "cyan",
    spinner: {
      interval: 80,
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    },
  });
  const spinner = yoctoSpinner({
    color: "cyan",
    spinner: {
      interval: 200,
      frames: [".  ", ".. ", "...", " ..", "  .", "   "],
    },
  });

  mainSpinner.start("Setting up cvstack...");
  // 1. Create directories
  spinner.start("Setting up resources");
  const dirResult = createDirectories();
  if (dirResult.isErr()) {
    spinner.error("Failed to create directories");
    mainSpinner.error("Failed to set up cvstack");
    return err(dirResult.error);
  }
  spinner.success("Created resources");

  // 2. Create env file if it doesn't exist
  spinner.start("Creating app environment");
  const envResult = await writeFile(ENV_FILEPATH, DEFAULT_ENV_CONTENT);
  // const envResult = await writeEnvFile(DEFAULT_ENV_CONTENT);
  if (envResult.isErr()) {
    spinner.error("Failed to create environment file");
    mainSpinner.error("Failed to set up cvstack");
    return err(envResult.error);
  }
  spinner.success("Created environment file");

  // 3. Create database
  spinner.start("Setting up database");
  const dbResult = createDatabase();
  if (dbResult.isErr()) {
    spinner.error("Failed to create database");
    mainSpinner.error("Failed to set up cvstack");
    return err(dbResult.error);
  }
  spinner.success("Created database");

  // 4. Run migrations
  spinner.start("Running database migrations");
  const migrationResult = runMigrations();
  if (migrationResult.isErr()) {
    spinner.error("Failed to run database migrations");
    mainSpinner.error("Failed to set up cvstack");
    return err(migrationResult.error);
  }
  spinner.success("Ran database migrations");

  // 5. Mark setup process as complete to ensure that env file errors immediately from env, rather than openai
  const setupCompleteResult = await writeFile(
    SETUP_COMPLETE_FILEPATH,
    new Date().toISOString(),
  );
  if (setupCompleteResult.isErr()) {
    return err(setupCompleteResult.error);
  }
  mainSpinner.success("Setup complete!");

  return ok();
}

// export function ensureBuntime() {
//   const isBun = typeof Bun !== undefined && Bun.version;
//
//   if (!isBun) {
//     console.error(`
// ❌ This CLI requires Bun to run.
//
// You can install Bun by running:
//
//   curl -fsSL https://bun.sh/install | bash
//        (or)
//   npm install -g bun
//
//   > Read more at: https://bun.com/
//
// Once installed, you can use cvstack by running:
//   cvstack|cvs --help
// `);
//     process.exit(1);
//   }
// }
