import type z from "zod";

interface BaseCVStackError {
  name: string;
  message: string;
  safe: boolean;
  location: string;
  additionalContext?: any;
}

export type ZodInputSource = "cli" | "scraper" | "ai";

export type CVStackZodError = BaseCVStackError & {
  _type: "zod";
  source: ZodInputSource;
  issues: z.core.$ZodIssue[];
};

export type CVStackAIError = BaseCVStackError & {
  _type: "ai";
};

export type CVStackPromptError = BaseCVStackError & {
  _type: "prompt";
};

export type CVStackCLIError = BaseCVStackError & {
  _type: "cli";
};

export type CVStackDatabaseError = BaseCVStackError & {
  _type: "db";
};

export type CVStackUnknownError = BaseCVStackError & {
  _type: "unknown";
};

export type CVStackFileError = BaseCVStackError & {
  _type: "file";
};

export type CVStackShellError = BaseCVStackError & {
  _type: "shell";
};

export type CVStackError =
  | CVStackDatabaseError
  | CVStackUnknownError
  | CVStackZodError
  | CVStackShellError
  | CVStackCLIError
  | CVStackAIError
  | CVStackPromptError
  | CVStackFileError;
