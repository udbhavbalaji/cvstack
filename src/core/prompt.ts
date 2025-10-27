// External imports
import enquirer, { type Choice } from "enquirer";
import { ResultAsync } from "neverthrow";
import z from "zod";

// Internal imports
import type { /*Choice,*/ PromptValidateFunction } from "@/types/prompt";
import safeExec from "@/core/catchresult";
import { unwrapAsync } from "@/core/unwrap";
import { urlValidator } from "@/core/helpers";
import errors from "@/core/errors";

const { prompt } = enquirer;

// async function _unsafeConfirmPrompt(message: string, defaultValue: boolean) {
//   const response = await prompt<{ result: boolean }>({
//     type: "confirm",
//     name: "result",
//     message,
//     initial: defaultValue,
//   });
//   return response.result;
// }

const confirm = safeExec.getSafeFnAsync(
  async (message: string, defaultValue?: boolean) => {
    const response = await prompt<{ result: boolean }>({
      type: "confirm",
      name: "result",
      message,
      initial: defaultValue,
    });
    return response.result;
  },
  { location: "confirmPrompt" },
);

// async function _unsafeTextPrompt(
//   message: string,
//   defaultValue?: string,
//   validate?: PromptValidateFunction,
// ) {
//   const response = await prompt<{ result: string }>({
//     name: "result",
//     type: "input",
//     initial: defaultValue,
//     message,
//     validate,
//   });
//
//   return response.result;
// }

const text = safeExec.getSafeFnAsync(
  async (
    message: string,
    defaultValue?: string,
    validate?: PromptValidateFunction,
  ) => {
    const response = await prompt<{ result: string }>({
      name: "result",
      type: "input",
      initial: defaultValue,
      message,
      validate,
    });

    return response.result;
  },
  { location: "textPrompt" },
);

// async function _unsafeNumberPrompt(
//   message: string,
//   defaultValue?: number,
//   validate?: PromptValidateFunction,
// ) {
//   const response = await prompt<{ result: number }>({
//     type: "numeral",
//     name: "result",
//     message,
//     initial: defaultValue,
//     validate,
//   });
//
//   return response.result;
// }

const number = safeExec.getSafeFnAsync(
  async (
    message: string,
    defaultValue?: number,
    validate?: PromptValidateFunction,
  ) => {
    const response = await prompt<{ result: number }>({
      type: "numeral",
      name: "result",
      message,
      initial: defaultValue,
      validate,
    });

    return response.result;
  },
  { location: "numberPrompt" },
);

// async function _unsafeTogglePrompt(
//   message: string,
//   enabled: string,
//   disabled: string,
// ) {
//   const response = await prompt<{ result: boolean }>({
//     type: "toggle",
//     message,
//     name: "result",
//     enabled,
//     disabled,
//   });
//
//   return response.result;
// }

const toggle = safeExec.getSafeFnAsync(
  async (message: string, enabled: string, disabled: string) => {
    const response = await prompt<{ result: boolean }>({
      type: "toggle",
      message,
      name: "result",
      enabled,
      disabled,
    });

    return response.result;
  },
  { location: "togglePrompt" },
);

// async function _unsafeSelectPrompt<T extends string>(
//   message: string,
//   choices: readonly T[],
// ) {
//   const response = await prompt<{ result: T }>({
//     type: "select",
//     name: "result",
//     message,
//     choices: choices.map((choice) => choice),
//   });
//
//   return response.result;
// }

const select = <T extends string>(message: string, choices: readonly T[]) =>
  safeExec.getSafeFnAsync(
    async () => {
      const response = await prompt<{ result: T }>({
        type: "select",
        name: "result",
        message,
        choices: choices.map((choice) => choice),
      });

      return response.result;
    },
    { location: "selectPrompt" },
  )();

// async function _unsafeSearchPrompt<T>(message: string, choices: Choice<T>[]) {
//   const response = await prompt<{ result: T }>({
//     type: "autocomplete",
//     name: "result",
//     message,
//     choices: choices.map((choice) => {
//       return { ...choice };
//     }),
//   });
//
//   return response.result;
// }

const search = <T>(message: string, choices: Choice<T>[]) =>
  safeExec.getSafeFnAsync(
    async () => {
      const response = await prompt<{ result: T }>({
        type: "autocomplete",
        name: "result",
        message,
        choices: choices.map((choice) => {
          return { ...choice };
        }),
      });

      return response.result;
    },
    { location: "searchPrompt" },
  )();

// async function _unsafeFormPrompt<T>(
//   message: string,
//   choices: readonly Choice<T>[],
// ) {
//   const response = await prompt<{
//     result: Record<(typeof choices)[number]["name"], T>;
//   }>({
//     type: "form",
//     name: "result",
//     message,
//     choices: choices.map((choice) => {
//       return { ...choice };
//     }),
//   });
//
//   return response.result;
// }

const form = <T>(message: string, choices: readonly Choice<T>[]) =>
  safeExec.getSafeFnAsync(
    async () => {
      const response = await prompt<{
        result: Record<(typeof choices)[number]["name"], T>;
      }>({
        type: "form",
        name: "result",
        message,
        choices: choices.map((choice) => {
          return { ...choice };
        }),
      });

      return response.result;
    },
    { location: "formPrompt" },
  )();

// async function _unsafePasswordPrompt(message: string) {
//   const response = await prompt<{ result: string }>({
//     type: "password",
//     name: "result",
//     message,
//   });
//
//   return response.result;
// }

const password = (message: string) =>
  safeExec.getSafeFnAsync(
    async () => {
      const response = await prompt<{ result: string }>({
        type: "password",
        name: "result",
        message,
      });

      return response.result;
    },
    { location: "passwordPrompt" },
  )();

// export const passwordPrompt = (message: string) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(_unsafePasswordPrompt(message), (err) =>
//       errors.handle.promptError(err, "passwordPrompt", { message }),
//     ),
//   );
//
// export const confirmPrompt = (message: string, defaultValue: boolean) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(
//       _unsafeConfirmPrompt(message, defaultValue),
//       (err) => errors.handle.promptError(err, "confirmPrompt", message),
//     ),
//     `confirmPrompt:${message}`,
//   );
//
// export const togglePrompt = (
//   message: string,
//   trueVal: string,
//   falseVal: string,
// ) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(
//       _unsafeTogglePrompt(message, trueVal, falseVal),
//       (err) => errors.handle.promptError(err, "togglePrompt", message),
//     ),
//     `togglePrompt:${message}`,
//   );
//
// export const textPrompt = (
//   message: string,
//   defaultValue?: string,
//   validate?: (value: string) => string | boolean | Promise<string | boolean>,
// ) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(
//       _unsafeTextPrompt(message, defaultValue, validate),
//       (err) => errors.handle.promptError(err, "textPrompt", message),
//     ),
//     `textPrompt:${message}`,
//   );
//
// export const numberPrompt = (
//   message: string,
//   defaultValue?: number,
//   validate?: PromptValidateFunction,
// ) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(
//       _unsafeNumberPrompt(message, defaultValue, validate),
//       (err) => errors.handle.promptError(err, "numberPrompt", message),
//     ),
//     `numberPrompt:${message}`,
//   );
//
// export const singleSelectPrompt = <T extends string>(
//   message: string,
//   choices: readonly T[],
// ) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(_unsafeSelectPrompt(message, choices), (err) =>
//       errors.handle.promptError(err, "selectPrompt", { message, choices }),
//     ),
//     `selectPrompt:message=${message}:choices=${choices}`,
//   );
//
// export const searchPrompt = <T>(message: string, choices: Choice<T>[]) =>
//   // ): Promise<T> =>
//   unwrapAsync(
//     ResultAsync.fromPromise(_unsafeSearchPrompt(message, choices), (err) =>
//       errors.handle.promptError(err, "searchPrompt", { message, choices }),
//     ),
//     `searchPrompt:message=${message}`,
//   );
//
// export const formPrompt = <T>(message: string, choices: Choice<T>[]) =>
//   unwrapAsync(
//     ResultAsync.fromPromise(_unsafeFormPrompt(message, choices), (err) =>
//       errors.handle.promptError(err, "formPrompt"),
//     ),
//   );

export const prompts = {
  confirm,
  toggle,
  text,
  number,
  select,
  search,
  form,
  password,
  getAppInfo: async (jobUrl: string) => {
    const referral = await text(
      "Were you referred for this position? If yes, enter the referrer's name: ",
      "",
      (value) => {
        const res = z.string().safeParse(value);

        return res.success
          ? res.success
          : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
      },
    );

    const appMethod = await toggle("How did you apply: ", "Other", "Linkedin");

    let applicationLink = jobUrl;

    if (appMethod) {
      applicationLink = await text(
        "Enter the link where you applied: ",
        "",
        (value) => urlValidator(value, "other"),
      );
    }

    return {
      referral,
      appMethod: appMethod ? ("Linkedin" as const) : ("Other" as const),
      applicationLink,
    };
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function getAppInfo(jobUrl: string) {
//   const referral = await textPrompt(
//     "Were you referred for this position? If yes, enter the referrer's name: ",
//     "",
//     (value) => {
//       const res = z.string().safeParse(value);
//
//       return res.success
//         ? res.success
//         : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
//     },
//   );
//
//   const appMethod = await togglePrompt(
//     "How did you apply: ",
//     "Other",
//     "Linkedin",
//   );
//
//   let applicationLink = jobUrl;
//
//   if (appMethod) {
//     applicationLink = await textPrompt(
//       "Enter the link where you applied: ",
//       "",
//       (value) => urlValidator(value, "other"),
//     );
//   }
//
//   return {
//     referral,
//     appMethod: appMethod ? ("Linkedin" as const) : ("Other" as const),
//     applicationLink,
//   };
// }
//
// export { getAppInfo };
