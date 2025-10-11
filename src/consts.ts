// External imports
import path from "node:path";
import os from "node:os";

// HACK: No Internal imports

export const APP_DIR = path.join(os.homedir(), ".cvstack");

export const RESOURCES_DIR = path.join(APP_DIR, "resources");

export const LOG_DIR = path.join(APP_DIR, ".logs");

export const ENV_FILEPATH = path.join(RESOURCES_DIR, ".env");

export const DATABASE_PATH = path.join(APP_DIR, "cvstack.db");

export const MIGRATIONS_DIR = path.join(RESOURCES_DIR, "migrations");

export const REQUIRED_DIRS = [APP_DIR, RESOURCES_DIR, LOG_DIR];

// App Constants

export const DEFAULT_ENV_CONTENT = `# CVStack Environment Configuration
OPENROUTER_API_KEY=""
`;

export const appStatuses = [
  "NOT APPLIED",
  "APPLIED",
  "PRE-SCREENING",
  "ONLINE ASSESSMENT",
  "HIRING MANAGER INTERVIEW",
  "BACKGROUND CHECK",
  "OFFERED",
  "ACCEPTED",
] as const;
