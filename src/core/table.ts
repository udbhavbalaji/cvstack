import type { InsertJobModel, SelectJobModel } from "@/types/db";
import Table from "cli-table3";
import log from "@/core/logger";
import type { PrintableJob } from "@/types/logger";

const jobTable = new Table({
  head: ["Field", "Value"],
  colWidths: [30, 70],
  wordWrap: true,
  wrapOnWordBoundary: true,
  style: {
    head: ["cyan", "cyan"],
    border: ["white", "white"],
  },
});

const multiJobsTable = new Table({
  head: [
    "  ",
    "Job Id",
    "Title",
    "Company Name",
    "Job Details",
    "Location",
    "Salary",
    "Status",
    "Date Applied",
  ],
  colWidths: [5, 15, 30, 15, 20, 20, 30, 10, 15],
  // truncate: "...",
});

function printSingleJobTable(job: InsertJobModel) {
  Object.entries(job).forEach(([key, value]) => {
    jobTable.push([key, String(value)]);
  });

  console.log(jobTable.toString());
}

function printMultipleJobsTable(jobs: PrintableJob[]) {
  jobs.forEach((job) => {
    multiJobsTable.push([
      job.starred,
      job.jobId,
      job.title,
      job.companyName,
      job.jobDetails,
      job.location,
      job.salary,
      job.applicationStatus,
      job.dateApplied,
    ]);
  });

  console.log(multiJobsTable.toString());
}

function printJobs(jobs: SelectJobModel[]) {
  if (jobs.length === 0) {
    log.warn("No jobs found!");
    return;
  } else if (jobs.length === 1) {
    printSingleJobTable(jobs[0]!);
    return;
  }
}

export { printSingleJobTable, printMultipleJobsTable };
