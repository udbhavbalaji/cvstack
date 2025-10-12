// External imports
import chalk from "chalk";
import path from "node:path";

// Internal imports
import { LOG_DIR } from "@/consts";
import type { LogLevel, LogMode } from "@/types/logger";
import { writeLog, writeLogAsync } from "@/core/file";
import { getEnv } from "@/consts";

const env = getEnv();

const messageColors = {
  debug: chalk.gray,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
};

// Helper function to safely check if we're in development mode
const isDevelopment = () => {
  // return (
  //   process.env.BUN_ENV === "development" ||
  //   process.env.NODE_ENV === "development"
  // );
  return env.BUN_ENV;
};

const log = {
  debug: <T>(value: T, ...args: any[]) =>
    isDevelopment() &&
    console.log(getFormattedLogMessage(value, "debug", "dev", args)),
  info: <T>(value: T, ...args: any[]) =>
    console.log(
      getFormattedLogMessage(
        value,
        "info",
        isDevelopment() ? "dev" : "prod",
        args,
      ),
    ),
  warn: <T>(value: T, ...args: any[]) =>
    console.log(
      getFormattedLogMessage(
        value,
        "warn",
        isDevelopment() ? "dev" : "prod",
        args,
      ),
    ),
  error: <T>(value: T, ...args: any[]) =>
    console.log(
      getFormattedLogMessage(
        value,
        "error",
        isDevelopment() ? "dev" : "prod",
        args,
      ),
    ),
  toFile: {
    debug: <T>(value: T, ...args: any[]) => logToFile("debug", value, ...args),
    info: <T>(value: T, ...args: any[]) => logToFile("info", value, ...args),
    warn: <T>(value: T, ...args: any[]) => logToFile("warn", value, ...args),
    error: <T>(value: T, ...args: any[]) => logToFile("error", value, ...args),
    async: {
      debug: <T>(value: T, ...args: any[]) =>
        logToFileAsync("debug", value, ...args),
      info: <T>(value: T, ...args: any[]) =>
        logToFileAsync("info", value, ...args),
      warn: <T>(value: T, ...args: any[]) =>
        logToFileAsync("warn", value, ...args),
      error: <T>(value: T, ...args: any[]) =>
        logToFileAsync("error", value, ...args),
    },
  },
};

async function logToFileAsync<T>(level: LogLevel, value: T, ...args: any[]) {
  const logDetails = getLogDetails(level, value, ...args);

  const logFilepath = path.join(LOG_DIR, logDetails.filename);

  const logWriteResult = await writeLogAsync(
    logFilepath,
    `\n${logDetails.logMessage}\n`,
  );

  if (logWriteResult.isOk()) {
    log.info(`Logfile created at ${logFilepath}`);
  } else {
    log.error(
      "Logfile couldn't be created. Logging in the console instead...\n",
    );
    log.error(logDetails.logMessage);
  }
}

function logToFile<T>(level: LogLevel, value: T, ...args: any[]) {
  const logDetails = getLogDetails(level, value, ...args);
  const logFilepath = path.join(LOG_DIR, logDetails.filename);

  const logWriteResult = writeLog(logFilepath, `\n${logDetails.logMessage}\n`);

  if (logWriteResult.isOk()) {
    log.info(`Logfile created at ${logFilepath}`);
  } else {
    log.error(
      "Logfile couldn't be created. Logging in the console instead...\n",
    );
    log.error(logDetails.logMessage);
  }
}

function getLogDetails<T>(
  level: LogLevel,
  value: T,
  ...args: any[]
): Record<"filename" | "logMessage", string> {
  const now = new Date();
  const currentTimestamp = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const currentDate = now.toISOString().split("T")[0];
  const logFilename = `jat_${level}_${currentDate}.log`;

  return {
    filename: logFilename,
    logMessage: ` ${currentTimestamp}  [ ${level.toUpperCase()} ]\t${value}\nAdditional Context:\n\n${formatLogArgs(args)}`,
  };
}

function formatLogArgs(args: any[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    })
    .join("\n");
}

function getFormattedLogMessage<T>(
  value: T,
  level: LogLevel,
  mode: LogMode,
  args?: any[],
) {
  const color = messageColors[level];
  const prefix = `${mode === "dev" ? `${color.inverse(` ${level} `)}\t` : `${color(`${level}: `)}`}`;
  // const prefix = `${mode === "dev" ? `${colors.inverse(color(` ${level} `))}\t` : `${color(`${level}: `)}`}`;
  const output = `${prefix}${color(String(value))}${args && mode === "dev" && args.length > 0 ? `\n\nAdditional Args: \n${args.map((arg) => color(String(arg))).join("\n")}` : ""}`;
  return output;
}

export { log as default };
