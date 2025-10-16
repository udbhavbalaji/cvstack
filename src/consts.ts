// External imports
import { createEnv, type DefaultCombinedSchema } from "@t3-oss/env-core";
import { config as importEnv } from "dotenv";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import z from "zod";

// HACK: No Internal imports

export const APP_DIR = path.join(os.homedir(), ".cvstack");

export const RESOURCES_DIR = path.join(APP_DIR, "resources");

export const LOG_DIR = path.join(APP_DIR, ".logs");

export const ENV_FILEPATH = path.join(RESOURCES_DIR, ".env");

export const DATABASE_PATH = path.join(APP_DIR, "cvstack.db");

export const MIGRATIONS_DIR = path.join(
  path.dirname(import.meta.dir),
  "drizzle",
);

export const REQUIRED_DIRS = [APP_DIR, RESOURCES_DIR, LOG_DIR];

export const PYTHON_EXEC_DEV = path.join(
  path.dirname(import.meta.dir),
  "cvstack-scraper",
  "dist",
  "cvstack-scraper",
  "cvstack-scraper",
);

export const PYTHON_EXEC_PROD = path.join(
  path.dirname(import.meta.dir),
  "bin",
  "cvstack-scraper",
  "cvstack-scraper",
);

export const PYTHON_EXECUTABLE = fs.existsSync(PYTHON_EXEC_PROD)
  ? PYTHON_EXEC_PROD
  : PYTHON_EXEC_DEV;

export const ApiKeySchema = z
  .string("Enter a valid OpenRouter API key")
  .startsWith("sk-", "Enter a valid OpenRouter API key");

export const SETUP_COMPLETE_FILEPATH = path.join(APP_DIR, ".setup-complete");

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
  // Load environment variables
  importEnv({ path: ENV_FILEPATH, quiet: true, override: true });

  if (!_env) {
    _env = createEnv({
      server: {
        OPENROUTER_API_KEY: fs.existsSync(SETUP_COMPLETE_FILEPATH)
          ? ApiKeySchema
          : ApiKeySchema.optional(),
        BUN_ENV: z
          .literal(
            "development",
            "CvStack runs in the production env by default. If you want further debugging information, set this to 'development'",
          )
          .optional(),
      },
      runtimeEnv: process.env,
      emptyStringAsUndefined: true,
      onValidationError: (issues) => {
        let message = "Invalid environment variables:\n\n";

        issues.forEach((issue, idx) => {
          message += `${idx + 1}. ${String(issue.path![0])}: ${issue.message}\n`;
        });

        console.error(message);

        console.error(
          "Environment isn't valid. Run 'cvstack ai-auth' to update your API Key",
          // NOTE: cvstack env will be implmented when there are more than 1 env vars
          // "Environment isn't valid. Run 'cvstack env' to update your env variables",
        );
        process.exit(1);
      },
    });
  }

  // todo: can add error handling logic here to crash the app if env isn't found
  return _env;
};

export const linkedinBaseUrl = "https://www.linkedin.com/jobs/view";

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
