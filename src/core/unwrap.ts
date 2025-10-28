// External imports
import { type ResultAsync, type Result } from "neverthrow";

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
    return result.error.safe ? safeCrash(newErr) : crashSync(newErr);
  }

  return result.value;
}

async function unwrapAsync<T, E extends CVStackError>(
  res: ResultAsync<T, E>,
  additionalLocationContext?: string,
): Promise<T> {
  const result = await res;

  if (result.isErr()) {
    const newErr: CVStackError = {
      ...result.error,
      location: `${result.error.location}${additionalLocationContext ? `:${additionalLocationContext}` : ""}`,
    };
    return result.error.safe ? safeCrash(newErr) : crashSync(newErr);
  }

  return result.value;
}

export { unwrap, unwrapAsync };
