// External imports
import { Command } from "commander";
import { err } from "neverthrow";

// Internal imports
import { prompts } from "@/core/prompt";
import { copytoClipboard } from "@/core/helpers";
import { editAction } from "@/commands/edit";
import { safeCrash } from "@/core/terminate";
import { linkedinBaseUrl } from "@/consts";
import getDb from "@/external/db";

const search = new Command("search")
  .description("Search for a saved job and perform actions on it")
  .action(async () => {
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

    const job = await prompts.search(
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

    const action = await prompts.select("Choose an action: ", actionOptions);

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
        await editAction(job, db.update.details);
        break;
      }

      // case "Copy company name to clipboard" : {}
      //
      // case "Copy title to clipboard" : {}
    }
  });

export { search as default };
