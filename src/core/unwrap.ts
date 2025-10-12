// External imports
import { err, type Result } from "neverthrow";

// Internal imports
import type { CVStackError } from "@/types/errors";
import { crashSync, safeCrash } from "@/core/terminate";

function unwrap<T, E extends CVStackError>(
  result: Result<T, E>,
  additionalLocationContext?: string,
): T {
  if (result.isErr()) {
    const newErr: CVStackError = {
      ...result.error,
      location: `${result.error.location}${additionalLocationContext ? `:${additionalLocationContext}` : ""}`,
    };
    return result.error.safe ? safeCrash(err(newErr)) : crashSync(err(newErr));
  }

  return result.value;
}

export { unwrap };
