// External imports
import { Command } from "commander";
import { err } from "neverthrow";
import z from "zod";

//  Internal imports
import { parseSchema } from "@/core/zod/parse";
import { safeCrash } from "@/core/terminate";
import getDb from "@/external/db";

const star = new Command("star")
  .description("Star/Unstar a job application you have high hopes for!")
  .option(
    "-i, --id [id]",
    "The job ID of the job you want to star.",
    (value) => {
      const jobId = parseSchema(
        z.coerce.number("Enter the job Id fo the job. Must be of type number."),
        value,
        "cli",
      );

      return jobId;
    },
  )
  .action(async (opts) => {
    const { id } = opts;

    if (!id) {
      return safeCrash(
        err({
          _type: "cli",
          name: "MissingArgsError",
          message: "Missing required argument: id",
          safe: true,
          location: "star:actionHandler",
        }),
      );
    }

    const db = getDb();

    const job = await db.query.getJobOrThrow(id);

    await db.update
      .toggleStarred(id, job.starred)
      .then(() => console.log(job.starred ? "Unstarred!" : "Starred!"));
  });

export { star as default };
