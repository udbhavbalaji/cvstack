export type PromptValidateFunction = (
  value: string,
) => string | boolean | Promise<string | boolean>;
