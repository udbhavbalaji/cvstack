// External imports
import { Command } from "commander";
import { err } from "neverthrow";

// Internal imports
import { jobUrlSchema } from "@/core/zod/schema";
import { parseSchema } from "@/core/zod/parse";
import { extractJobId } from "@/core/helpers";
import { safeCrash } from "@/core/terminate";
import getDb from "@/external/db";
import { getJobAnalysis } from "@/external";
import type { InsertJobModel } from "@/types/db";
import log from "@/core/logger";
import { printSingleJobTable } from "@/core/table";
import { confirmPrompt } from "@/core/prompt";
import { ensureSetup } from "..";
import { getEnv } from "@/consts";

const add = new Command("add")
  .description("Add a new job to your tracker.")
  .argument("<job_url>", "The Linkedin job posting's Url", async (value) => {
    const jobUrl = parseSchema(jobUrlSchema, value, "cli");

    const jobId = extractJobId(jobUrl);

    const db = getDb();

    const jobExists = await db.query.exist(jobId);

    if (jobExists) {
      return safeCrash(
        err({
          _type: "cli",
          name: "DuplicateJobError",
          message: `Job with id ${jobId} already exists. Current status: ${jobExists.applicationStatus}`,
          safe: true,
          location: "add:job_url:argParser",
          additionalContext: { jobId, status: jobExists.applicationStatus },
        }),
      );
    }

    return jobUrl;
  })
  .action(async (job_url) => {
    await ensureSetup();

    const env = getEnv();
    const jobUrl = await job_url;

    const jobId = extractJobId(jobUrl);

    const jobAnalysis = await getJobAnalysis(jobUrl, env);

    const jobRecord: InsertJobModel = {
      ...jobAnalysis,
      jobId: jobId,
      referral: "",
      appMethod: "Other",
      applicationLink: jobUrl,
      applicationStatus: "NOT APPLIED",
      dateApplied: "",
    };

    printSingleJobTable(jobRecord);

    const confirmed = await confirmPrompt("Do you want to add this job?", true);

    const db = getDb();

    if (confirmed) {
      await db.insert(jobRecord);
      log.info("Job added successfully");
    } else {
      log.warn("Job not added!");
      process.exit(0);
    }
  });

export { add as default };
