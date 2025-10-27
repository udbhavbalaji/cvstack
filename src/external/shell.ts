import { PYTHON_EXECUTABLE } from "@/consts";
import safeExec from "@/core/catchresult";
import errors from "@/core/errors";
import { unwrapAsync } from "@/core/unwrap";
import { $ } from "bun";
import { ResultAsync } from "neverthrow";

async function _generateMigrations() {
  const output = await $`bun run db:generate"`.quiet().nothrow();

  if (output.exitCode !== 0) {
    throw errors.create.shellError(output.text(), "generateMigrations");
  }

  return output.text();
}

async function _runScraper(jobUrl: string) {
  // const output =
  //   await $`../dist/bin/cvstack-scraper/cvstack-scraper "${jobUrl}"`
  //     .quiet()
  //     .nothrow();
  const output = await $`${PYTHON_EXECUTABLE} "${jobUrl}"`.quiet().nothrow();

  if (output.exitCode !== 0) {
    throw errors.create.shellError(output.text(), "runScraper");
  }

  return output.json();
}

export const runScraper = safeExec.getSafeFnAsync(_runScraper, {
  location: "runScraper",
});

// export const runScraper = (jobUrl: string) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(_runScraper(jobUrl), (err) =>
//       errors.create.shellError(err, "runScraper"),
//     ),
//   );

export const generateMigrations = () =>
  ResultAsync.fromPromise(_generateMigrations(), (err) =>
    errors.create.shellError(err, "generateMigrations"),
  );
