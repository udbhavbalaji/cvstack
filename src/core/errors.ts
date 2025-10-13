// External imports

// Internal imports
import type { CVStackError, ZodInputSource } from "@/types/errors";
import { isCVStackError } from "@/core/type-guards";
import log from "./logger";
import { ZodError } from "zod";
import { capitalize } from "./helpers";
import { OpenAIError } from "openai";

const create = {
  zodError: (
    err: ZodError,
    fnName: string,
    source: ZodInputSource,
  ): CVStackError => {
    return {
      _type: "zod",
      name: `CVStack${capitalize(source)}ZodError`,
      message: err.message,
      location: fnName,
      safe: source === "cli",
      issues: err.issues,
      source,
    };
  },
  shellError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (typeof err === "string") {
      return {
        _type: "shell",
        name: "CVStackShellError",
        message: err,
        safe: false,
        location: fnName,
        additionalContext,
      };
    } else if (isCVStackError(err)) {
      return err;
    } else {
      return create.unknownError(err, fnName, additionalContext);
    }
  },
  databaseError: (
    message: string,
    safe: boolean,
    location: string,
    additionalContext?: any,
  ): CVStackError => {
    return {
      _type: "db",
      name: "CVStackDatabaseError",
      message,
      safe,
      location,
      additionalContext,
    };
  },
  unknownError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    return {
      _type: "unknown",
      name: "CVStackError",
      message:
        (err as any).message?.toString() ?? "Oops! Something went wrong.",
      safe: false,
      location: fnName,
      additionalContext,
    };
  },
};

const handle = {
  setupError: (err: unknown, fnName: string, additionalContext?: any) => { },
  zodError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof ZodError) {
      return create.zodError(err, fnName, additionalContext);
    } else {
      return handle.unknownError(err, fnName, additionalContext);
    }
  },
  fileError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof SyntaxError) {
      return {
        _type: "file",
        name: "SyntaxError",
        message: err.message,
        safe: false,
        location: fnName ?? "unknown",
        additionalContext,
      };
    } else if (err instanceof Error) {
      let errorMessage: string;
      if ((err as any).code === "EACCES") {
        errorMessage = "Permission denied! Use 'sudo' with your command.";
      } else if ((err as any).code === "ENOENT") {
        errorMessage = "File/directory doesn't exist.";
      } else if ((err as any).code === "EISDIR") {
        errorMessage = "Expected file but found directory";
      } else if ((err as any).code === "ENOTDIR") {
        errorMessage = "Not a directory";
      } else {
        errorMessage = "Something's gone horribly wrong.";
      }
      log.debug((err as Error).message);
      return {
        _type: "file",
        name: "FileSystemError",
        message: errorMessage,
        location: fnName ?? "unknown",
        safe: false,
        additionalContext,
      };
    } else return handle.unknownError(err, fnName, additionalContext);
  },
  promptError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof Error) {
      return {
        _type: "prompt",
        name: "CVStackPromptError",
        message: "Cancelled.",
        safe: true,
        location: fnName,
        additionalContext,
      };
    } else {
      return handle.unknownError(err, fnName, additionalContext);
    }
  },
  databaseError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof Error) {
      const code = (err as any).code ?? "";
      const message = err.message;

      if (
        code === "SQLITE_CONSTRAINT" ||
        message.includes("constraint failed")
      ) {
        return {
          _type: "db",
          name: "CVStackDatabaseError",
          message: `Database constraint error: ${message}`,
          safe: true,
          location: fnName,
          additionalContext: additionalContext,
        };
      } else if (
        code === "SQLITE_BUSY" ||
        message.includes("database is locked")
      ) {
        return {
          _type: "db",
          name: "CVStackDatabaseError",
          message: "Database is unavailable.",
          safe: false,
          location: fnName,
          additionalContext: additionalContext,
        };
      } else if (
        code === "SQLITE_READONLY" ||
        message.includes("attempt to write a readonly database")
      ) {
        return {
          _type: "db",
          name: "CVStackDatabaseError",
          message: "Database is readonly",
          safe: false,
          location: fnName,
          additionalContext: additionalContext,
        };
      } else if (
        code === "SQLITE_NOTFOUND" ||
        message.includes("no such table")
      ) {
        return {
          _type: "db",
          name: "CVStackDatabaseError",
          message: "Table not found",
          safe: false,
          location: fnName,
          additionalContext: additionalContext,
        };
      } else if (code === "SQLITE_ERROR" || message.includes("SQLITE_ERROR")) {
        return {
          _type: "db",
          name: "CVStackDatabaseError",
          message: "Syntax error in sql statement",
          safe: false,
          location: fnName,
          additionalContext: additionalContext,
        };
      }
    }
    return handle.unknownError(err, fnName, additionalContext);
  },
  shellError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (typeof err === "string") {
      return create.shellError(err, fnName, additionalContext);
    } else {
      return handle.unknownError(err, fnName, additionalContext);
    }
  },
  aiError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof OpenAIError) {
      let message = err.message;
      if (err.message.includes("Missing credentials.")) {
        message =
          "OpenRouter API key is missing. Run 'cvstack ai-auth' to update your API key.";
      } else if (err.message.includes("401")) {
        message =
          "Invalid API key. Run 'cvstack ai-auth' to update your API key.";
      }
      return {
        _type: "ai",
        name: `CVStackAIError: ${err.name}`,
        message,
        safe: false,
        location: fnName,
        additionalContext: additionalContext ?? `${err.cause} - ${err.stack}`,
      };
    } else return handle.unknownError(err, fnName, additionalContext);
  },
  unknownError: (
    err: unknown,
    fnName: string,
    additionalContext?: any,
  ): CVStackError => {
    const fallbackError: CVStackError = {
      _type: "unknown",
      name: "UnknownError",
      message: (err as any).toString(),
      safe: false,
      location: fnName ?? "unknown",
      additionalContext,
    };

    if (isCVStackError(err)) {
      return err;
    } else if (err instanceof Error) {
      fallbackError.name = err.name;
      fallbackError.message = err.message;
      fallbackError.additionalContext = {
        ...fallbackError.additionalContext,
        stack: err.stack,
      };
    } else if (err && typeof err === "object") {
      const errObj = err as Record<string, unknown>;

      fallbackError.name = errObj.name?.toString() ?? "UnknownError";
      fallbackError.message =
        errObj.message?.toString() ?? "Oops! Something went wrong.";

      if (errObj.stack) {
        fallbackError.additionalContext = {
          ...fallbackError.additionalContext,
          stack: errObj.stack,
        };
      }
    } else if (typeof err === "string") {
      fallbackError.message = err;
    }

    return fallbackError;
  },
};

export default { create, handle };
