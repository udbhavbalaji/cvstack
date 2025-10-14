// External imports
import { Result, ResultAsync } from "neverthrow";
import fs from "node:fs";

// Internal imports
import errors from "@/core/errors";
import { ENV_FILEPATH } from "@/consts";

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

const writeEnvFile = (content: string) =>
  ResultAsync.fromPromise(
    Bun.write(ENV_FILEPATH, content, { createPath: true }),
    (err) => errors.handle.fileError(err, "createEnvFile"),
  );

export { writeLog, writeLogAsync, writeEnvFile };
