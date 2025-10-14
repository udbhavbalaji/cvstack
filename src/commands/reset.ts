// External imports
import { Command } from "commander";
import { err } from "neverthrow";

// Internal imports
import { confirmPrompt } from "@/core/prompt";
import { safeCrash } from "@/core/terminate";
import { ensureSetup } from "@/index";
import getDb from "@/external/db";
import log from "@/core/logger";

const reset = new Command("reset")
  .description(
    "Completely reset your tracker. Only do this if you want to restart your tracking process.",
  )
  .option(
    "-n, [no-confirm]",
    // "-n, --no-confirm [no-confirm]",
    "Skip confirmation before resetting tracker.",
    false,
  )
  .action(async (opts) => {
    await ensureSetup();

    if (!opts.n) {
      const confirmReset = await confirmPrompt(
        "Are you sure you want to reset your tracker?",
        false,
      );

      if (!confirmReset) {
        return safeCrash(
          err({
            _type: "cli",
            name: "UserAbortedOperationError",
            message: "Aborting reset operation.",
            safe: true,
            location: "reset:actionHandler",
          }),
        );
      }
    }

    const db = getDb();

    await db.delete.all().then(() => {
      log.info("CVStack has been reset completely!");
    });
  });

export { reset as default };
