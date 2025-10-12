// Internal imports
import type { CVStackError } from "@/types/errors";

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

export { isCVStackError };
