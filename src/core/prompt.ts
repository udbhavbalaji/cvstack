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

/**
 * @deprecated use `prompts.confirm` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the confirm prompt
 * @returns boolean value for the confirm prompt
 */
async function _unsafeConfirmPrompt(message: string, defaultValue: boolean) {
  const response = await prompt<{ result: boolean }>({
    type: "confirm",
    name: "result",
    message,
    initial: defaultValue,
  });
  return response.result;
}

/**
 * @deprecated use `prompts.text` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the text prompt
 * @param validate input validation function for the text prompt
 *
 * @returns string value entered by the user
 */
async function _unsafeTextPrompt(
  message: string,
  defaultValue?: string,
  validate?: PromptValidateFunction,
) {
  const response = await prompt<{ result: string }>({
    name: "result",
    type: "input",
    initial: defaultValue,
    message,
    validate,
  });

  return response.result;
}

/**
 * @deprecated use `prompts.number` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the number prompt
 * @param validate input validation function for the number prompt
 *
 * @returns number value entered by the user
 */
async function _unsafeNumberPrompt(
  message: string,
  defaultValue?: number,
  validate?: PromptValidateFunction,
) {
  const response = await prompt<{ result: number }>({
    type: "numeral",
    name: "result",
    message,
    initial: defaultValue,
    validate,
  });

  return response.result;
}

/**
 * @deprecated use `prompts.toggle` instead
 *
 * @param message message to display to the user before the prompt
 * @param enabled value to display as the enabled state of the toggle prompt
 * @param disabled value to display as the disabled state of the toggle prompt
 *
 * @returns boolean value entered by the user (need to be mapped to the desired value)
 */
async function _unsafeTogglePrompt(
  message: string,
  enabled: string,
  disabled: string,
) {
  const response = await prompt<{ result: boolean }>({
    type: "toggle",
    message,
    name: "result",
    enabled,
    disabled,
  });

  return response.result;
}

/**
 * @deprecated use `prompts.select` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices choices to display to the user
 *
 * @returns the choice selected by the user
 */
async function _unsafeSelectPrompt<T extends string>(
  message: string,
  choices: readonly T[],
) {
  const response = await prompt<{ result: T }>({
    type: "select",
    name: "result",
    message,
    choices: choices.map((choice) => choice),
  });

  return response.result;
}

/**
 * @deprecated use `prompts.search` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices results to search through
 *
 * @returns the choice selected by the user after searching
 */
async function _unsafeSearchPrompt<T>(message: string, choices: Choice<T>[]) {
  const response = await prompt<{ result: T }>({
    type: "autocomplete",
    name: "result",
    message,
    choices: choices.map((choice) => {
      return { ...choice };
    }),
  });

  return response.result;
}

/**
 * @deprecated use `prompts.form` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices values to include in the form [name: string, value: T]
 *
 * @returns the object containing the values entered by the user
 */
async function _unsafeFormPrompt<T>(
  message: string,
  choices: readonly Choice<T>[],
) {
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
}

/**
 * @deprecated use `prompts.password` instead
 *
 * @param message message to display to the user before the prompt
 *
 * @returns the password entered by the user
 */
async function _unsafePasswordPrompt(message: string) {
  const response = await prompt<{ result: string }>({
    type: "password",
    name: "result",
    message,
  });

  return response.result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @deprecated use `prompts.password` instead
 *
 * @param message message to display to the user before the prompt
 *
 * @returns the password entered by the user
 */
export const passwordPrompt = (message: string) =>
  unwrapAsync(
    ResultAsync.fromPromise(_unsafePasswordPrompt(message), (err) =>
      errors.handle.promptError(err, "passwordPrompt", { message }),
    ),
  );

/**
 * @deprecated use `prompts.confirm` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the confirm prompt
 * @returns boolean value for the confirm prompt
 */
export const confirmPrompt = (message: string, defaultValue: boolean) =>
  unwrapAsync(
    ResultAsync.fromPromise(
      _unsafeConfirmPrompt(message, defaultValue),
      (err) => errors.handle.promptError(err, "confirmPrompt", message),
    ),
    `confirmPrompt:${message}`,
  );

/**
 * @deprecated use `prompts.toggle` instead
 *
 * @param message message to display to the user before the prompt
 * @param enabled value to display as the enabled state of the toggle prompt
 * @param disabled value to display as the disabled state of the toggle prompt
 *
 * @returns boolean value entered by the user (need to be mapped to the desired value)
 */
export const togglePrompt = (
  message: string,
  trueVal: string,
  falseVal: string,
) =>
  unwrapAsync(
    ResultAsync.fromPromise(
      _unsafeTogglePrompt(message, trueVal, falseVal),
      (err) => errors.handle.promptError(err, "togglePrompt", message),
    ),
    `togglePrompt:${message}`,
  );

/**
 * @deprecated use `prompts.text` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the text prompt
 * @param validate input validation function for the text prompt
 *
 * @returns string value entered by the user
 */
export const textPrompt = (
  message: string,
  defaultValue?: string,
  validate?: (value: string) => string | boolean | Promise<string | boolean>,
) =>
  unwrapAsync(
    ResultAsync.fromPromise(
      _unsafeTextPrompt(message, defaultValue, validate),
      (err) => errors.handle.promptError(err, "textPrompt", message),
    ),
    `textPrompt:${message}`,
  );

/**
 * @deprecated use `prompts.number` instead
 *
 * @param message message to display to the user before the prompt
 * @param defaultValue default value for the number prompt
 * @param validate input validation function for the number prompt
 *
 * @returns number value entered by the user
 */
export const numberPrompt = (
  message: string,
  defaultValue?: number,
  validate?: PromptValidateFunction,
) =>
  unwrapAsync(
    ResultAsync.fromPromise(
      _unsafeNumberPrompt(message, defaultValue, validate),
      (err) => errors.handle.promptError(err, "numberPrompt", message),
    ),
    `numberPrompt:${message}`,
  );

/**
 * @deprecated use `prompts.select` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices choices to display to the user
 *
 * @returns the choice selected by the user
 */
export const singleSelectPrompt = <T extends string>(
  message: string,
  choices: readonly T[],
) =>
  unwrapAsync(
    ResultAsync.fromPromise(_unsafeSelectPrompt(message, choices), (err) =>
      errors.handle.promptError(err, "selectPrompt", { message, choices }),
    ),
    `selectPrompt:message=${message}:choices=${choices}`,
  );

/**
 * @deprecated use `prompts.search` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices results to search through
 *
 * @returns the choice selected by the user after searching
 */
export const searchPrompt = <T>(message: string, choices: Choice<T>[]) =>
  unwrapAsync(
    ResultAsync.fromPromise(_unsafeSearchPrompt(message, choices), (err) =>
      errors.handle.promptError(err, "searchPrompt", { message, choices }),
    ),
    `searchPrompt:message=${message}`,
  );

/**
 * @deprecated use `prompts.form` instead
 *
 * @param message message to display to the user before the prompt
 * @param choices values to include in the form [name: string, value: T]
 *
 * @returns the object containing the values entered by the user
 */
export const formPrompt = <T>(message: string, choices: Choice<T>[]) =>
  unwrapAsync(
    ResultAsync.fromPromise(_unsafeFormPrompt(message, choices), (err) =>
      errors.handle.promptError(err, "formPrompt"),
    ),
  );

/**
 * @deprecated use `prompts.getAppInfo` instead
 *
 * @param jobUrl url of the job being applied for
 *
 * @returns the object containing the values entered by the user
 */
async function getAppInfo(jobUrl: string) {
  const referral = await textPrompt(
    "Were you referred for this position? If yes, enter the referrer's name: ",
    "",
    (value) => {
      const res = z.string().safeParse(value);

      return res.success
        ? res.success
        : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
    },
  );

  const appMethod = await togglePrompt(
    "How did you apply: ",
    "Other",
    "Linkedin",
  );

  let applicationLink = jobUrl;

  if (appMethod) {
    applicationLink = await textPrompt(
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
}

export { getAppInfo };

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
