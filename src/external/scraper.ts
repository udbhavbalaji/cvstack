import { ResultAsync } from "neverthrow";
import yoctoSpinner from "yocto-spinner";
import errors from "@/core/errors";
import { runScraper } from "@/external/shell";
import { parseSchema } from "@/core/zod/parse";
import { scrapedJobSchema } from "@/core/zod/schema";
import { unwrapAsync } from "@/core/unwrap";
import chalk from "chalk";
import { crash } from "@/core/terminate";

const scraperSpinner = yoctoSpinner({
  color: "cyan",
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
});

async function _scrapeJobData(jobUrl: string) {
  const jobJsonData = await runScraper(jobUrl);

  return parseSchema(scrapedJobSchema, jobJsonData, "scraper");
}

export const scrapeJobDataWrapped = (jobUrl: string) =>
  ResultAsync.fromPromise(_scrapeJobData(jobUrl), (err) =>
    errors.handle.shellError(err, "scrapeJobData"),
  );

const scrapeJobData = (jobUrl: string) =>
  unwrapAsync(
    ResultAsync.fromThrowable(
      async () => {
        scraperSpinner.start(`Scraping job data for ${jobUrl}`);

        setTimeout(() => {
          scraperSpinner.color = "green";
        }, 5000);

        const textUpdateTimeout = setTimeout(() => {
          scraperSpinner.color = "yellow";
          scraperSpinner.text = `Damn this one's tough. Gimme a min...\n\n`;
        }, 10000);

        const res = await scrapeJobDataWrapped(jobUrl);

        clearTimeout(textUpdateTimeout);

        if (res.isErr()) {
          scraperSpinner.error(
            chalk.red(`Failed to scrape job data from ${jobUrl}`),
          );
          return crash(res);
        }

        scraperSpinner.success(
          chalk.cyan(`Successfully scraped job data from ${jobUrl}`),
        );

        return res.value;
      },
      (err) => errors.handle.shellError(err, "scrapeJobData", { jobUrl }),
    )(),
  );

export { scrapeJobData as default };
