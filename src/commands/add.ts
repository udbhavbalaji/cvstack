// External imports
import { Command } from "commander";

// Internal imports

const add = new Command("add")
  .description("Add a new job to your tracker.")
  .argument("<job_url>", "The Linkedin job posting's Url", async (value) => {
    const jobUrl = parseSchema(jobUrlSchema, value, "cli");

    const jobId = extractJobId(jobUrl);

    const jobExists = await db.query.exist(jobId);

    if (jobExists) {
      return safeCrash(
        err({
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
    const jobUrl = await job_url;

    const jobId = extractJobId(jobUrl);

    const apiSpinner = yoctoSpinner({
      color: "cyan",
      spinner: {
        interval: 80,
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      },
    });

    const jobAnalysis = await getJobAnalysis(jobUrl, apiSpinner);

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

    if (confirmed) {
      await db.insert(jobRecord);
      log.info("Job added successfully");
    } else {
      log.warn("Job not added!");
      process.exit(0);
    }
  });

export { add as default };
