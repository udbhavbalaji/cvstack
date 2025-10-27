import errors from "@/core/errors";
import type { ZodInputSource } from "@/types/errors";
import type { ZodType } from "zod";
import { Result, ResultAsync } from "neverthrow";
import { unwrap, unwrapAsync } from "@/core/unwrap";
import safeExec from "../catchresult";

// function _unsafeParseSchema<Schema extends ZodType>(
//   schema: Schema,
//   value: unknown,
//   source: ZodInputSource,
// ) {
//   const res = schema.safeParse(value);
//
//   if (res.success) {
//     return res.data;
//   }
//
//   throw errors.create.zodError(res.error, "parseSchema", source);
// }
//
// async function _unsafeParseSchemaAsync<Schema extends ZodType>(
//   schema: Schema,
//   value: unknown,
//   source: ZodInputSource,
// ) {
//   const res = await schema.safeParseAsync(value);
//
//   if (res.success) {
//     return res.data;
//   }
//
//   throw errors.create.zodError(res.error, "parseSchemaAsync", source);
// }

const syncParse = <Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: ZodInputSource,
) =>
  safeExec.getSafeFn(
    () => {
      const res = schema.safeParse(value);

      if (res.success) {
        return res.data;
      }

      throw errors.create.zodError(res.error, "parseSchema", source);
    },
    { location: "parseSchema" },
  )();

const asyncParse = <Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  source: ZodInputSource,
) =>
  safeExec.getSafeFnAsync(
    async () => {
      const res = await schema.safeParseAsync(value);

      if (res.success) {
        return res.data;
      }

      throw errors.create.zodError(res.error, "parseSchemaAsync", source);
    },
    { location: "parseSchemaAsync" },
  );

export const parse = { sync: syncParse, async: asyncParse };

// const parseSchema = <Schema extends ZodType>(
//   schema: Schema,
//   value: unknown,
//   source: ZodInputSource,
// ) =>
//   unwrap(
//     Result.fromThrowable(
//       () => _unsafeParseSchema(schema, value, source),
//       (err) => errors.handle.zodError(err, "parseSchema", value),
//     )(),
//   );
//
// const parseSchemaUnwrapped = <Schema extends ZodType>(
//   schema: Schema,
//   value: unknown,
//   source: ZodInputSource,
// ) =>
//   Result.fromThrowable(
//     () => _unsafeParseSchema(schema, value, source),
//     (err) => errors.handle.zodError(err, "parseSchema", value),
//   )();
//
// const parseSchemaAsync = async <Schema extends ZodType>(
//   schema: Schema,
//   value: unknown,
//   source: ZodInputSource,
// ) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(
//       _unsafeParseSchemaAsync(schema, value, source),
//       (err) => errors.handle.zodError(err, "parseSchemaAsync", value),
//     ),
//     "safeParseAsync",
//   );
//
// export { parseSchema, parseSchemaAsync, parseSchemaUnwrapped };
