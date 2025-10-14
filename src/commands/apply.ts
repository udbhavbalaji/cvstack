// External imports
import { Command } from "commander";
import { err } from "neverthrow";
import yoctoSpinner from "yocto-spinner";
import z from "zod";

// Internal imports
import { extractJobId, urlValidator } from "@/core/helpers";
import {
  confirmPrompt,
  getAppInfo,
  numberPrompt,
  textPrompt,
  togglePrompt,
} from "@/core/prompt";
import { printSingleJobTable } from "@/core/table";
import { crash, safeCrash } from "@/core/terminate";
import type { InsertJobModel } from "@/types/db";
import { jobUrlSchema } from "@/core/zod/schema";
import { parseSchema } from "@/core/zod/parse";
import { getJobAnalysis } from "@/external";
import log from "@/core/logger";
import getDb from "@/external/db";
import { ensureSetup } from "..";
import { getEnv } from "@/consts";

const apply = new Command("apply")
  .description("Apply for a Linkedin job.")
  .option(
    "-u, --url [url]",
    "Linkedin Url of the job you're applying for.",
    (value) => {
      const jobUrl = parseSchema(jobUrlSchema, value, "cli");

      return jobUrl;
    },
  )
  .option(
    "-i, --id [id]",
    "Linkedin job ID of the job you're applying for. Use 'cvstack show' to find the ID for a job already added. Otherwise, id can be found from the Url (https://www.linkedin.com/jobs/view/<job_id>)",
    (value) => {
      const jobId = parseSchema(
        z.coerce.number("Enter a valid Linkedin Job Id"),
        value,
        "cli",
      );

      return jobId;
    },
  )
  .action(async (opts) => {
    await ensureSetup();

    const env = getEnv();

    const { url, id } = opts;
    let jobUrl: string | undefined = undefined;
    let jobId: number | undefined = undefined;

    if (id) {
      jobId = id;
      jobUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
    }

    if (url) {
      jobUrl = url;
      jobId = extractJobId(url);
    }

    if (!jobUrl && !jobId) {
      const inputMethod = await togglePrompt(
        "Choose one: ",
        "Linkedin Url",
        "Linkedin Job Id",
      );

      if (inputMethod) {
        jobUrl = await textPrompt(
          "Enter Linkedin Job Url: ",
          undefined,
          (value) => urlValidator(value, "linkedin"),
        );
        jobId = extractJobId(jobUrl);
      } else {
        jobId = await numberPrompt(
          "Enter Linkedin Job Id: ",
          undefined,
          (value) => {
            const res = z.coerce.number().safeParse(value);

            return res.success
              ? res.success
              : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
          },
        );
        jobUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
      }
    }

    if (!jobUrl || !jobId) {
      return crash(
        err({
          _type: "fatal",
          name: "FatalError",
          message: "Job Id or Job Url is undefined even after all assignments",
          safe: false,
          location: "apply:actionHandler",
          additionalContext: { jobUrl, jobId },
        }),
      );
    }

    const db = getDb();

    const job = await db.query.getJob(jobId);

    if (job) {
      if (job.applicationStatus !== "NOT APPLIED") {
        return safeCrash(
          err({
            _type: "cli",
            name: "DuplicateJobError",
            message: `Job with id ${jobId} already exists. Current status: ${job.applicationStatus}`,
            safe: true,
            location: "apply:actionHandler",
            additionalContext: { jobId, job },
          }),
        );
      } else {
        // handle the updating of the status
        //  fix: need to handle the referral input from user for this case

        const appInfo = await getAppInfo(jobUrl);

        const dbSpinner = yoctoSpinner({
          color: "cyan",
          spinner: {
            interval: 80,
            frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
          },
        });
        dbSpinner.start(
          `Updating job status for ${job.title} - ${job.companyName} @${job.locationCity}${` ${job.locationCountry}`}...`,
        );

        await db.update
          .details(jobId, {
            ...appInfo,
            applicationStatus: "APPLIED",
            dateApplied: new Date().toISOString(),
          })
          .then((updateRes) => {
            // await db.update.status(jobId, "APPLIED").then((updateRes) => {
            if (updateRes.isOk()) {
              dbSpinner.success("Job status updated successfully!");
            } else {
              dbSpinner.error("Job status update failed!");
              return crash(updateRes);
            }
          });
      }
    } else {
      // handle the adding of the job and additional steps

      const jobAnalysisPromise = getJobAnalysis(jobUrl, env);

      const appInfo = await getAppInfo(jobUrl);

      const jobAnalysis = await jobAnalysisPromise;

      const jobRecord: InsertJobModel = {
        ...jobAnalysis,
        jobId: jobId,
        referral: appInfo.referral,
        appMethod: appInfo.appMethod ? "Company's Job Portal" : "Linkedin",
        applicationLink: appInfo.applicationLink,
        applicationStatus: "APPLIED",
        dateApplied: new Date().toISOString(),
      };

      printSingleJobTable(jobRecord);

      const confirmed = await confirmPrompt(
        "Do you want to add this job?",
        true,
      );

      if (confirmed) {
        await db.insert(jobRecord);
        log.info("Job added successfully");
      } else {
        log.warn("Job not added!");
        process.exit(0);
      }
    }
  });

export { apply as default };
