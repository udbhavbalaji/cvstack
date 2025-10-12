import errors from "@/core/errors";
import type { ZodInputSource, ZodInputSource } from "@/types/errors";
import type { ZodType } from "zod";
import { Result, ResultAsync } from "neverthrow";
import { unwrap, unwrapAsync } from "@/core/unwrap";

function _unsafeParseSchema<Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: ZodInputSource,
) {
  const res = schema.safeParse(value);

  if (res.success) {
    return res.data;
  }

  throw errors.create.zodError(res.error, "parseSchema", source);
}

async function _unsafeParseSchemaAsync<Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: SchemaSource,
) {
  const res = await schema.safeParseAsync(value);

  if (res.success) {
    return res.data;
  }

  throw new CVZodError(res.error, source);
}

const parseSchema = <Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: SchemaSource,
) =>
  unwrap(
    Result.fromThrowable(
      () => _unsafeParseSchema(schema, value, source),
      (err) => handleZodError(err, "parseSchema", value),
    )(),
  );

const parseSchemaUnwrapped = <Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: SchemaSource,
) =>
  Result.fromThrowable(
    () => _unsafeParseSchema(schema, value, source),
    (err) => handleZodError(err, "parseSchema", value),
  )();

const parseSchemaAsync = async <Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: SchemaSource,
) =>
  unwrapAsync(
    ResultAsync.fromPromise(
      _unsafeParseSchemaAsync(schema, value, source),
      (err) => handleZodError(err, "parseSchemaAsync", value),
    ),
    "safeParseAsync",
  );

export { parseSchema, parseSchemaAsync, parseSchemaUnwrapped };
