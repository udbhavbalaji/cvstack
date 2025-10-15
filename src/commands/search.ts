// External imports
import { Command } from "commander";

// Internal imports
import { ensureSetup } from "@/index";
import getDb from "@/external/db";
import { safeCrash } from "@/core/terminate";
import { err } from "neverthrow";
import { formPrompt, searchPrompt, singleSelectPrompt } from "@/core/prompt";
import { copytoClipboard } from "@/core/helpers";
import { linkedinBaseUrl } from "@/consts";
import type { UpdateJobDetailsModel } from "@/types/db";
import log from "@/core/logger";

const search = new Command("search")
  .description("Search for a saved job and perform actions on it")
  .action(async () => {
    await ensureSetup();

    const db = getDb();

    const jobs = await db.query.getAll();

    if (jobs.length === 0) {
      return safeCrash(
        err({
          _type: "cli",
          name: "NotFoundError",
          message: "No jobs found",
          safe: true,
          location: "search:actionHandler",
        }),
      );
    }

    const job = await searchPrompt(
      "Search for a job application: ",
      jobs.map((job) => {
        return {
          name: `[${job.applicationStatus}] - ${job.title}, ${job.companyName} @ ${job.locationCity !== "" ? `${job.locationCity}, ` : ""}${job.locationCountry}`,
          value: job,
        };
      }),
    );

    const actionOptions = [
      "Copy Job Id to clipboard",
      "Copy Linkedin Url to clipboard",
      "Copy application link",
      "Edit application details",
      // "Copy company name to clipboard",
      // "Copy title to clipboard",
    ] as const;

    const action = await singleSelectPrompt(
      "Choose an action: ",
      actionOptions,
    );

    switch (action) {
      case "Copy Job Id to clipboard": {
        await copytoClipboard(job.jobId.toString());
        break;
      }
      case "Copy Linkedin Url to clipboard": {
        await copytoClipboard(`${linkedinBaseUrl}/${job.jobId}`);
        break;
      }

      case "Copy application link": {
        await copytoClipboard(job.applicationLink);
        break;
      }

      case "Edit application details": {
        // todo: details i want to allow editing
        // 1. title
        // 2. company name
        // 3. location
        // 4. application status
        // 5. referral
        // 6. application link
        // 7. application method

        const choices = [
          { name: "title", message: "Title", initial: job.title },
          {
            name: "companyName",
            message: "Company Name",
            initial: job.companyName,
          },
          {
            name: "locationCity",
            message: "City",
            initial: job.locationCity ?? "",
          },
          {
            name: "locationCountry",
            message: "Country",
            initial: job.locationCountry,
          },
          {
            name: "applicationStatus",
            message: "Status",
            initial: job.applicationStatus,
          },
          {
            name: "referral",
            message: "Referrer Name",
            initial: job.referral ?? "",
          },
          {
            name: "applicationLink",
            message: "Application Link",
            initial: job.applicationLink,
          },
          {
            name: "appMethod",
            message: "Application Method",
            initial: job.appMethod,
          },
        ];

        const editedDetails = await formPrompt(
          "Go through the form to edit the details of the job application:\n\n",
          choices,
        );

        await db.update
          .details(job.jobId, editedDetails as UpdateJobDetailsModel)
          .then(() => log.info("Successfully updated the job details"));

        break;
      }

      // case "Copy company name to clipboard" : {}
      //
      // case "Copy title to clipboard" : {}
    }
  });

export { search as default };
