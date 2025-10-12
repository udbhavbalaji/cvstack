export interface SetupStatus {
  directoriesExist: boolean;
  envFileExists: boolean;
  databaseExists: boolean;
  migrationsApplied: boolean;
  isFullySetup: boolean;
}
