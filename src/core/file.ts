// External imports
import { Result, ResultAsync } from "neverthrow";
import fs from "node:fs";

// Internal imports
import errors from "@/core/errors";

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

export { writeLog, writeLogAsync };
