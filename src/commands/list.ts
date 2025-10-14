// External imports
import { Command } from "commander";
import { err } from "neverthrow";

// Internal imports
import { appStatuses } from "@/consts";
import { safeCrash } from "@/core/terminate";
import type { ApplicationStatus, SelectJobModel } from "@/types/db";
import getDb from "@/external/db";
import { searchPrompt, singleSelectPrompt } from "@/core/prompt";
import { printMultipleJobsTable, printSingleJobTable } from "@/core/table";
import { ensureSetup } from "..";

const list = new Command("list")
  .description("List the jobs you've applied for.")
  .alias("ls")
  .option(
    "-s, --status [status]",
    "Specify the application status of the jobs you want to list.",
    (value) => {
      if (value === "") {
        return "";
      }

      const lowerAppStatuses = appStatuses.map((status) =>
        status.toLowerCase(),
      );
      if (lowerAppStatuses.includes(value.toLowerCase())) {
        return value;
      }

      safeCrash(
        err({
          _type: "cli",
          name: "InvalidArgError",
          message: `Invalid application status: ${value}. Valid statuses are: ${appStatuses.join(", ")}`,
          safe: true,
          location: "list:status:optionParser",
          additionalContext: { input: value },
        }),
      );
    },
  )
  .option(
    "--search",
    "Specify if you want to search for a job to view it. This will spawn a search tool to search through your jobs",
    false,
  )
  .action(async (opts) => {
    await ensureSetup();

    console.log(opts);

    const { status, search } = opts;
    let where: Partial<SelectJobModel> = {};
    let appStatus: ApplicationStatus | undefined = undefined;

    if (typeof status === "boolean" && status) {
      // if (status === "") {
      appStatus = await singleSelectPrompt(
        "Select application status you want to view: ",
        appStatuses,
      );
      where.applicationStatus = appStatus;
    } else if (typeof status === "string") {
      where.applicationStatus = status.toUpperCase() as ApplicationStatus;
      // where.applicationStatus = status.toUpperCase() as ApplicationStatus;
    }

    const db = getDb();

    const jobs = await db.query.getAllWhere(where);

    if (jobs.length === 0) {
      safeCrash(
        err({
          _type: "cli",
          name: "NotFoundError",
          message: "No jobs found for the selected filters",
          safe: true,
          location: "list:actionHandler",
          additionalContext: { filters: { status } },
        }),
      );
    }

    if (search) {
      if (jobs.length === 1) {
        printSingleJobTable(jobs[0]!);
        return;
      }

      const job = await searchPrompt(
        "Select the job you want to view: ",
        jobs.map((job) => {
          return {
            name: `[${job.applicationStatus}] - ${job.title}, ${job.companyName} @ ${job.locationCity !== "" ? `${job.locationCity}, ` : ""}${job.locationCountry}`,
            value: job,
          };
        }),
      );
      printSingleJobTable(job);
      return;
    }

    const printableJobs = jobs.map((job) => {
      const {
        jobId,
        applicationStatus,
        title,
        companyName,
        workArrangement,
        jobType,
        locationCity,
        locationCountry,
        salaryMin,
        salaryMax,
        salaryCurrency,
        starred,
      } = job;

      return {
        starred: starred ? "⭐" : "",
        jobId,
        title,
        companyName,
        jobDetails: `${jobType} - ${workArrangement}`,
        location: `${locationCity === "" ? "" : `${locationCity}, `}${locationCountry}`,
        salary: `Min: ${salaryMin === 0 ? "-" : salaryMin}; Max: ${salaryMax === 0 ? "-" : salaryMax} ${salaryCurrency}`,
        applicationStatus,
        dateApplied: job.dateApplied,
      };
    });

    printMultipleJobsTable(printableJobs);
    return;
  });

export { list as default };
