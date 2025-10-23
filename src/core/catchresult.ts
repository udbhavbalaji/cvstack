import { SafeExec } from "catchresult";
import { ZodError } from "zod";

import errors from "@/core/errors";

const safeExec = new SafeExec([
  // Handle all errors here:
  // 1. Zod Error
  [
    (err) => err instanceof ZodError,
    (err, ctx) => {
      const error = errors.handle.zodError(
        err,
        ctx?.location,
        ctx?.additionalContext,
      );
    },
  ],
]);

export default safeExec;
