import { ResultAsync } from "neverthrow";
import yoctoSpinner from "yocto-spinner";
import errors from "@/core/errors";
import { runScraper } from "@/external/shell";
import { parse } from "@/core/zod/parse";
import { scrapedJobSchema } from "@/core/zod/schema";
import { unwrapAsync } from "@/core/unwrap";
import chalk from "chalk";
import { crashSync } from "@/core/terminate";
import safeExec from "@/core/catchresult";

const scraperSpinner = yoctoSpinner({
  color: "cyan",
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
});

/**
 * @deprecated use scrapeJobData instead
 *
 * @param jobUrl url of the job to scrape
 *
 * @returns the scraped job data as a JSON object
 */
async function _scrapeJobData(jobUrl: string) {
  const jobJsonData = await runScraper(jobUrl);

  return parse.sync(scrapedJobSchema, jobJsonData, "scraper");
}

async function scrapeJobData(jobUrl: string) {
  scraperSpinner.start(`Scraping job data for ${jobUrl}`);

  setTimeout(() => {
    scraperSpinner.color = "green";
  }, 5000);

  const textUpdateTimeout = setTimeout(() => {
    scraperSpinner.color = "yellow";
    scraperSpinner.text = `Damn this one's tough. Gimme a min...\n\n`;
  }, 10000);

  const jobJsonData = await runScraper.addContext({
    spinner: scraperSpinner,
    spinnerErrorMessage: chalk.red(
      `Failed to scrape job data from ${jobUrl}\n`,
    ),
  })(jobUrl);

  clearTimeout(textUpdateTimeout);

  scraperSpinner.success(
    chalk.cyan(`Successfully scraped job data from ${jobUrl}\n`),
  );

  return parse.sync(scrapedJobSchema, jobJsonData, "scraper");
}

// export const scrapeJobDataWrapped = (jobUrl: string) =>
//   ResultAsync.fromPromise(_scrapeJobData(jobUrl), (err) =>
//     errors.handle.shellError(err, "scrapeJobData"),
//   );
//
// const scrapeJobData = (jobUrl: string) =>
//   unwrapAsync(
//     ResultAsync.fromThrowable(
//       async () => {
//         scraperSpinner.start(`Scraping job data for ${jobUrl}`);
//
//         setTimeout(() => {
//           scraperSpinner.color = "green";
//         }, 5000);
//
//         const textUpdateTimeout = setTimeout(() => {
//           scraperSpinner.color = "yellow";
//           scraperSpinner.text = `Damn this one's tough. Gimme a min...\n\n`;
//         }, 10000);
//
//         const res = await scrapeJobDataWrapped(jobUrl);
//
//         clearTimeout(textUpdateTimeout);
//
//         if (res.isErr()) {
//           scraperSpinner.error(
//             chalk.red(`Failed to scrape job data from ${jobUrl}`),
//           );
//           return crash(res);
//         }
//
//         scraperSpinner.success(
//           chalk.cyan(`Successfully scraped job data from ${jobUrl}`),
//         );
//
//         return res.value;
//       },
//       (err) => errors.handle.shellError(err, "scrapeJobData", { jobUrl }),
//     )(),
//   );

export { scrapeJobData as default };
