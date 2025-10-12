export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMode = "dev" | "prod";

export type PrintableJob = {
  starred: string;
  jobId: number;
  title: string;
  companyName: string;
  jobDetails: string;
  location: string;
  salary: string;
  applicationStatus: string;
  dateApplied: string;
};
