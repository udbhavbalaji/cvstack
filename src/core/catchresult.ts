// External imports
import { SafeExec } from "catchresult";
import { OpenAIError } from "openai";
import { ZodError } from "zod";

// Internal imports
import { isCVStackError, isCVStackZodError } from "@/core/type-guards";
import type { CVStackError, CVStackZodError } from "@/types/errors";
import { crashSync, safeCrash } from "@/core/terminate-alt";
import errors from "@/core/errors";

const safeExec = new SafeExec([
  // Handle all errors here:
  // 1. Zod Error
  [
    (err) => err instanceof ZodError,
    (e, ctx) => {
      const error = errors.handle.zodError(e, ctx?.location, {
        ...ctx?.additionalContext,
        args: ctx?.args,
      });

      return error.safe ? safeCrash(error) : crashSync(error);
    },
  ],
  [
    (err) => isCVStackZodError(err),
    (e) =>
      (e as CVStackZodError).safe
        ? safeCrash(e as CVStackZodError)
        : crashSync(e as CVStackZodError),
  ],
  // 2. File Errors
  [
    "ENOENT",
    // (err) => (err as any).code === "ENOENT",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      return crashSync({
        _type: "file",
        name: "FileSystemError",
        message: "File/directory doesn't exist.",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    "EACCES",
    // (err) => (err as any).code === "EACCES",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      return crashSync({
        _type: "file",
        name: "FileSystemError",
        message: "Permission denied! Use 'sudo' with your command.",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    "EISDIR",
    // (err) => (err as any).code === "EISDIR",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      return crashSync({
        _type: "file",
        name: "FileSystemError",
        message: "Expected file but found directory",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    "ENOTDIR",
    // (err) => (err as any).code === "ENOTDIR",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      return crashSync({
        _type: "file",
        name: "FileSystemError",
        message: "Not a directory",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  // 3. Shell Error
  [
    "ShellError",
    (e, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      const error = errors.handle.shellError(e, ctx?.location, {
        ...ctx?.additionalContext,
        args: ctx?.args,
      });

      return error.safe ? safeCrash(error) : crashSync(error);
    },
  ],
  // 4. Prompt Error
  [
    "",
    (_, ctx) => {
      return safeCrash({
        _type: "prompt",
        name: "CVStackPromptError",
        message: "Cancelled.",
        safe: true,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  // 5. JSON parse Error
  [
    SyntaxError,
    (e, ctx) => {
      return crashSync({
        _type: "file",
        name: "SyntaxError",
        message: (e as SyntaxError).message,
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  // 6. Open AI Error
  [
    OpenAIError,
    (e, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }

      const error = errors.handle.aiError(e, ctx?.location, {
        ...ctx?.additionalContext,
        args: ctx?.args,
      });

      return error.safe ? safeCrash(error) : crashSync(error);
    },
  ],
  // 7. Database Error
  [
    (err) => (err as any).code === "SQLITE_CONSTRAINT",
    (e, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }
      return crashSync({
        _type: "db",
        name: "CVStackDatabaseError",
        message: `Database constraint error: ${(e as Error).message}`,
        safe: true,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    (err) => (err as any).code === "SQLITE_BUSY",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }
      return crashSync({
        _type: "db",
        name: "CVStackDatabaseError",
        message: "Database is locked",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    (err) => (err as any).code === "SQLITE_READONLY",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }
      return crashSync({
        _type: "db",
        name: "CVStackDatabaseError",
        message: "Database is readonly",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    (err) => (err as any).code === "SQLITE_NOTFOUND",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }
      return crashSync({
        _type: "db",
        name: "CVStackDatabaseError",
        message: "Table not found",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    (err) => (err as any).code === "SQLITE_ERROR",
    (_, ctx) => {
      if (ctx?.spinner) {
        ctx?.spinner.error(ctx?.spinnerErrorMessage);
      }
      return crashSync({
        _type: "db",
        name: "CVStackDatabaseError",
        message: "Syntax error in sql statement",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    },
  ],
  [
    (err) => isCVStackError(err),
    (e) =>
      (e as CVStackError).safe
        ? safeCrash(e as CVStackError)
        : crashSync(e as CVStackError),
  ],
]).catchAll((e, ctx) => {
  if (e instanceof Error) {
    if (ctx?.location === "createEnv") {
      return crashSync({
        _type: "setup",
        name: "CVStackSetupError",
        message: "Invalid environment variables",
        safe: false,
        location: ctx?.location,
        additionalContext: { ...ctx?.additionalContext, args: ctx?.args },
      });
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ]).catchAll((err, args) => {
//   if (err instanceof Error) {
//     if (args?.location === "createEnv") {
//       return errors.handle.setupError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       });
//     }
//   } else {
//     return errors.handle.unknownError(err, args?.location, {
//       ...args?.additionalContext,
//       args: args?.args,
//     });
//   }
// });

// export const safeExec = new SafeExec([
//   // add all error handlers for the different types of errors that can happen
//
//   // 1. Zod Error
//   // done:
//   [
//     (err) => err instanceof ZodError,
//     (err, args) =>
//       errors.handle.zodError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // done:
//   [
//     // internally thrown zod error (created to capture issues well)
//     (err) => isCVStackZodError(err),
//     (err, args) =>
//       errors.handle.zodError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // 2. File Error
//   // done:
//   [
//     (err) =>
//       ["ENOENT", "EACCES", "EISDIR", "ENOTDIR"].includes((err as any).code),
//     (err, args) =>
//       errors.handle.fileError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // 3. Shell Error
//   // done:
//   [
//     (err) => (err as Error).name === "ShellError",
//     (err, args) => {
//       if (args?.spinner) {
//         args?.spinner.error(args?.spinnerErrorMessage);
//       }
//
//       return errors.handle.shellError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       });
//     },
//   ],
//   // 4. Prompt Error
//   // done:
//   [
//     "",
//     (err, args) =>
//       errors.handle.promptError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // 5. JSON parse Error
//   // done:
//   [
//     SyntaxError,
//     (err, args) =>
//       errors.handle.jsonError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // 6. Open AI Error
//   // done:
//   [
//     OpenAIError,
//     (err, args) => {
//       if (args?.spinner) {
//         args?.spinner.error(args?.spinnerErrorMessage);
//       }
//
//       console.log("coming herer");
//
//       return errors.handle.aiError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       });
//     },
//   ],
//   // 7. Database Error
//   // done:
//   [
//     "SQLITE",
//     (err, args) => {
//       if (args?.spinner) {
//         args?.spinner.error(args?.spinnerErrorMessage);
//       }
//       return errors.handle.databaseError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       });
//     },
//   ],
//   // 11. Catch all for all CVStackErrors
//   // done:
//   [
//     (err) => isCVStackError(err),
//     (err, args) =>
//       errors.handle.unknownError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       }),
//   ],
//   // 8. Env Error
//   // 9. Catch-all for typeof Error
//   // 10. Actual catch all for all types
//   //  Will have to do the above 3 in the catch all, so that they don't accidentally trigger when some other matchers are triggered
//   //
//   // done:
// ]).catchAll((err, args) => {
//   if (err instanceof Error) {
//     if (args?.location === "createEnv") {
//       return errors.handle.setupError(err, args?.location, {
//         ...args?.additionalContext,
//         args: args?.args,
//       });
//     }
//   } else {
//     return errors.handle.unknownError(err, args?.location, {
//       ...args?.additionalContext,
//       args: args?.args,
//     });
//   }
// });

export default safeExec;
