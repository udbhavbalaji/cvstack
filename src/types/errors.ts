interface BaseCVStackError {
  name: string;
  message: string;
  safe: boolean;
  location: string;
  additionalContext?: any;
}

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
  | CVStackShellError
  | CVStackFileError;
