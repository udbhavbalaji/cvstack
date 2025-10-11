import errors from "@/core/errors";
import { $ } from "bun";
import { ResultAsync } from "neverthrow";

async function _generateMigrations() {
  const output = await $`bun run db:generate"`.quiet().nothrow();

  if (output.exitCode !== 0) {
    throw errors.create.shellError(output.text(), "generateMigrations");
  }

  return output.text();
}

export const generateMigrations = () =>
  ResultAsync.fromPromise(_generateMigrations(), (err) =>
    errors.create.shellError(err, "generateMigrations"),
  );
