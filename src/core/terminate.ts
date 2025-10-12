// External imports
import type { Err } from "neverthrow";

// Internal imports
import type { CVStackError } from "@/types/errors";
import log from "@/core/logger";

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

function crashSync<E extends CVStackError>(err: Err<unknown, E>): never {
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

function safeCrash<E extends CVStackError>(err: Err<unknown, E>): never {
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

export { crash, crashSync, safeCrash };
