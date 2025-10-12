// External imports
import { createEnv, type DefaultCombinedSchema } from "@t3-oss/env-core";
import path from "node:path";
import os from "node:os";
import z from "zod";

// HACK: No Internal imports

export const APP_DIR = path.join(os.homedir(), ".cvstack");

export const RESOURCES_DIR = path.join(APP_DIR, "resources");

export const LOG_DIR = path.join(APP_DIR, ".logs");

export const ENV_FILEPATH = path.join(RESOURCES_DIR, ".env");

export const DATABASE_PATH = path.join(APP_DIR, "cvstack.db");

export const MIGRATIONS_DIR = path.join(RESOURCES_DIR, "migrations");

export const REQUIRED_DIRS = [APP_DIR, RESOURCES_DIR, LOG_DIR];

// Env - Lazy initialization to allow setup to run first

let _env: ReturnType<
  typeof createEnv<
    string | undefined,
    {
      OPENROUTER_API_KEY: z.ZodOptional<z.ZodString>;
      BUN_ENV: z.ZodOptional<z.ZodLiteral<"development">>;
    },
    {},
    {},
    [],
    DefaultCombinedSchema<
      {
        OPENROUTER_API_KEY: z.ZodOptional<z.ZodString>;
        BUN_ENV: z.ZodOptional<z.ZodLiteral<"development">>;
      },
      {},
      {}
    >
  >
> | null = null;

export const getEnv = () => {
  if (!_env) {
    _env = createEnv({
      // _env = createEnv({
      server: {
        OPENROUTER_API_KEY: z
          .string()
          .startsWith("sk-", "Enter a valid OpenRouter API key")
          .optional(),
        BUN_ENV: z.literal("development").optional(),
      },
      runtimeEnv: process.env,
      emptyStringAsUndefined: true,
    });
  }
  // todo: can add error handling logic here to crash the app if env isn't found
  return _env;
};

// Backward compatibility - will be removed later
// export const env = new Proxy({} as ReturnType<typeof createEnv>, {
//   get(target, prop) {
//     return getEnv()[prop as keyof ReturnType<typeof createEnv>];
//   },
// });

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
