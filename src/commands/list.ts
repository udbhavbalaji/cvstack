// External imports
import { Command } from "commander";
import { err } from "neverthrow";

// Internal imports
import { printMultipleJobsTable, printSingleJobTable } from "@/core/table";
import type { ApplicationStatus, SelectJobModel } from "@/types/db";
import { prompts } from "@/core/prompt";
import { getPrintableJob } from "@/core/helpers";
import { safeCrash } from "@/core/terminate";
import { appStatuses } from "@/consts";
import getDb from "@/external/db";
import log from "@/core/logger";

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

      safeCrash({
        _type: "cli",
        name: "InvalidArgError",
        message: `Invalid application status: ${value}. Valid statuses are: ${appStatuses.join(", ")}`,
        safe: true,
        location: "list:status:optionParser",
        additionalContext: { input: value },
      });
    },
  )
  .option("-d, [detailed]", "Get detailed information about a job.", false)
  .option("--star, [star]", "Get jobs that have been starree", false)
  .option(
    "--search",
    "Specify if you want to search for a job to view it. This will spawn a search tool to search through your jobs",
    false,
  )
  .action(async (opts) => {
    const { status, search, d: detailed, star } = opts;
    let where: Partial<SelectJobModel> = {};
    let appStatus: ApplicationStatus | undefined = undefined;

    if (typeof status === "boolean" && status) {
      appStatus = await prompts.select(
        "Select application status you want to view: ",
        appStatuses,
      );
      where.applicationStatus = appStatus;
    } else if (typeof status === "string") {
      where.applicationStatus = status.toUpperCase() as ApplicationStatus;
    }

    if (star) where.starred = true;

    const db = getDb();

    const jobs = await db.query.getAllWhere(where);

    if (jobs.length === 0) {
      safeCrash({
        _type: "cli",
        name: "NotFoundError",
        message: "No jobs found for the selected filters",
        safe: true,
        location: "list:actionHandler",
        additionalContext: { filters: { status } },
      });
    } else if (jobs.length === 1) {
      if (detailed) {
        printSingleJobTable(jobs[0]!);
        return;
      } else {
        printMultipleJobsTable([getPrintableJob(jobs[0]!)]);
        return;
      }
      // printSingleJobTable(jobs[0]!);
      // return;
    }

    if (search) {
      if (jobs.length === 1) {
        if (detailed) {
          printSingleJobTable(jobs[0]!);
          return;
        } else {
          printMultipleJobsTable([getPrintableJob(jobs[0]!)]);
          return;
        }
      }

      const job = await prompts.search(
        "Select the job you want to view: ",
        jobs.map((job) => {
          return {
            name: `[${job.applicationStatus}] - ${job.title}, ${job.companyName} @ ${job.locationCity !== "" ? `${job.locationCity}, ` : ""}${job.locationCountry}`,
            value: job,
          };
        }),
      );
      if (detailed) {
        printSingleJobTable(job);
        return;
      } else {
        printMultipleJobsTable([getPrintableJob(job)]);
        return;
      }
    }

    // const printableJobs = jobs.map((job) => {
    //   const {
    //     jobId,
    //     applicationStatus,
    //     title,
    //     companyName,
    //     workArrangement,
    //     jobType,
    //     locationCity,
    //     locationCountry,
    //     salaryMin,
    //     salaryMax,
    //     salaryCurrency,
    //     starred,
    //   } = job;
    //
    //   return {
    //     starred: starred ? "⭐" : "",
    //     jobId,
    //     title,
    //     companyName,
    //     jobDetails: `${jobType} - ${workArrangement}`,
    //     location: `${locationCity === "" ? "" : `${locationCity}, `}${locationCountry}`,
    //     salary: `Min: ${salaryMin === 0 ? "-" : salaryMin}; Max: ${salaryMax === 0 ? "-" : salaryMax} ${salaryCurrency}`,
    //     applicationStatus,
    //     dateApplied: job.dateApplied,
    //   };
    // });
    const printableJobs = jobs.map(getPrintableJob);

    if (detailed) {
      log.warn(
        `You can only view detailed information about a single job at a time.${search ? "" : " You can try to search for it using the --search flag"}`,
      );
    }
    printMultipleJobsTable(printableJobs);
    return;
  });

export { list as default };
