// External imports
import { Result, ResultAsync } from "neverthrow";
import fs from "node:fs";

// Internal imports
import errors from "@/core/errors";
import { ENV_FILEPATH, REQUIRED_DIRS } from "@/consts";
import log from "./logger";
import yoctoSpinner from "yocto-spinner";

const writeLog = (logFilepath: string, logMessage: string) =>
  Result.fromThrowable(
    () => fs.appendFileSync(logFilepath, `\n${logMessage}\n`),
    (err) =>
      errors.handle.fileError(err, "writeLog", [logFilepath, logMessage]),
  )();

const writeLogAsync = (logFilepath: string, logMessage: string) =>
  ResultAsync.fromPromise(
    Bun.write(logFilepath, `\n${logMessage}\n`, { createPath: true }),
    (err) =>
      errors.handle.fileError(err, "writeLogAsync", [logFilepath, logMessage]),
  );

function _createDirectories(dirs: string[]) {
  const spinner = yoctoSpinner({
    color: "cyan",
    spinner: {
      interval: 80,
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    },
  });

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      spinner.start(`Creating directory: ${dir}`);
      // log.info(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
      spinner.success(`Created: ${dir}`);
    }
  }
}

export const createDirectories = (dirs: string[] = REQUIRED_DIRS) =>
  Result.fromThrowable(
    () => _createDirectories(dirs),
    (err) => errors.handle.fileError(err, "createDirectories", { dirs }),
  )();

const writeFile = (filepath: string, content: string) =>
  ResultAsync.fromPromise(
    Bun.write(filepath, content, { createPath: true }),
    (err) => errors.handle.fileError(err, "writeFile", { filepath, content }),
  );

// export { writeLog, writeLogAsync, writeEnvFile, writeFile };
export { writeLog, writeLogAsync, writeFile };
