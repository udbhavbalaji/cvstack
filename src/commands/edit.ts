// External imports
import { Command } from "commander";

// Internal imports
import type { SelectJobModel, UpdateJobDetailsModel } from "@/types/db";
import { prompts } from "@/core/prompt";
// import type { CVStackError } from "@/types/errors";
import { parse } from "@/core/zod/parse";
// import { err, ResultAsync } from "neverthrow";
import { safeCrash } from "@/core/terminate";
import getDb from "@/external/db";
import log from "@/core/logger";
import z from "zod";

const edit = new Command("edit")
  .description("Edit the details of a job applicatin.")
  .option(
    "-i, --id [id]",
    "Linkedin job ID of the job you're applying for. Use 'cvstack show' to find the ID for a job already added. Otherwise, id can be found from the Url (https://www.linkedin.com/jobs/view/<job_id>)",
    (value) => {
      const jobId = parse.sync(
        z.coerce.number("Enter a valid Linkedin Job Id"),
        value,
        "cli",
      );

      return jobId;
    },
  )
  .action(async (opts) => {
    const { id } = opts;

    const db = getDb();

    let jobId: number;

    if (!id) {
      // get the jobId from User
      jobId = await prompts.number(
        "Enter Linkedin Job Id: ",
        undefined,
        (value) => {
          const res = z.coerce.number().safeParse(value);

          return res.success
            ? res.success
            : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
        },
      );
    } else {
      jobId = id;
    }

    const job = await db.query.getJob(jobId);

    if (!job) {
      return safeCrash({
        _type: "cli",
        name: "CVStackNotFoundError",
        message: `Job with id ${jobId} not found`,
        safe: true,
        location: "edit:actionHandler",
        additionalContext: { jobId },
      });
    }

    return await editAction(job, db.update.details);
  });

export async function editAction(
  job: SelectJobModel,
  updateFn: (jobId: number, where: UpdateJobDetailsModel) => Promise<void>,
  // ) => ResultAsync<void, CVStackError>,
) {
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
      disabled: true,
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

  const editedDetails = await prompts.form(
    "Go through the form to edit the details of the job application:\n\n",
    choices,
  );

  await updateFn(job.jobId, editedDetails as UpdateJobDetailsModel).then(() =>
    log.info("Successfully updated the job details"),
  );
}

export { edit as default };
