// External imports
import type { Err } from "neverthrow";

// Internal imports
import type { CVStackError } from "@/types/errors";
import log from "@/core/logger";

/**
 * @deprecated use `crashSync` instead
 *
 * @param err Err causing app to be crashed
 *
 * @returns never
 */
async function crash<E extends CVStackError>(
  err: Err<unknown, E>,
): Promise<never> {
  if (err.error.safe) {
    log.warn(
      "Use safeCrashApp(err) to handle cases that can be displayed to the user.",
    );
  }

  await log.toFile.async.error(
    `${err.error.name}: ${err.error.message}`,
    err.error.additionalContext,
  );

  log.error(`${err.error.name}: ${err.error.message}`);
  log.debug(err.error.location);
  process.exit(1);
}

/**
 * @deprecated use `crashSync` instead
 *
 * @param err Err causing app to be crashed
 *
 * @returns never
 */
function syncCrash<E extends CVStackError>(err: Err<unknown, E>): never {
  if (err.error.safe) {
    log.warn(
      "Use safeCrashApp(err) to handle cases that can be displayed to the user.",
    );
  }

  log.toFile.error(
    `${err.error.name}: ${err.error.message}`,
    err.error.additionalContext,
  );

  log.error(`${err.error.name}: ${err.error.message}`);
  log.debug(err.error.location);
  process.exit(1);
}

/**
 * @deprecated use `safeCrash` instead
 *
 * @param err Err causing app to be crashed
 *
 * @returns never
 */
function crashSafely<E extends CVStackError>(err: Err<unknown, E>): never {
  if (!err.error.safe) {
    log.error(
      "Use crashApp(err) to handle cases that shouldn't be shown to the user.",
    );
    process.exit(1);
  }
  log.warn(`${err.error.message}`);
  log.debug(err.error.location);
  process.exit(0);
}

/**
 * Handles unsafe errors, which should create a logfile and crash the app
 *
 * @param err Error of type CVStackError causing app to be crashed
 *
 * @returns never
 */
function crashSync<E extends CVStackError>(err: E): never {
  if (err.safe) {
    log.warn(
      "Use safeCrashApp(err) to handle cases that can be displayed to the user.",
    );
  }

  log.toFile.error(`${err.name}: ${err.message}`, err.additionalContext);

  log.error(`${err.name}: ${err.message}`);
  log.debug(err.location);
  process.exit(1);
}

/**
 * Handles safe errors, which can be displayed to the user.
 *
 * @param err Error of type CVStackError causing app to be crashed
 *
 * @returns never
 */
function safeCrash<E extends CVStackError>(err: E): never {
  if (!err.safe) {
    log.error(
      "Use crashApp(err) to handle cases that shouldn't be shown to the user.",
    );
    process.exit(1);
  }
  log.warn(`${err.message}`);
  log.debug(err.location);
  process.exit(0);
}

export { crashSync, safeCrash };
