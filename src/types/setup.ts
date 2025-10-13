export interface SetupStatus {
  directoriesExist: boolean;
  envFileExists: boolean;
  databaseExists: boolean;
  migrationsApplied: boolean;
  isFullySetup: boolean;
}

export type CVStackEnvironment = Readonly<{
  OPENROUTER_API_KEY?: string;
  BUN_ENV?: "development";
}>;

export type CVStackConsts = {
  paths: {};
  env: {};
};
