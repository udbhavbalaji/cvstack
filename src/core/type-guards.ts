// Internal imports
import type { CVStackError, CVStackZodError } from "@/types/errors";

function isCVStackError(err: unknown): err is CVStackError {
  if (
    err &&
    typeof err === "object" &&
    "_type" in err &&
    "safe" in err &&
    "location" in err
  ) {
    return true;
  }
  return false;
}
function isCVStackZodError(err: unknown): err is CVStackZodError {
  if (isCVStackError(err) && err._type === "zod") {
    return true;
  }

  return false;
}

export { isCVStackError, isCVStackZodError };
