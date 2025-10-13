import scrapeJobData from "@/external/scraper";
import extractData from "@/external/ai/extract";
import type { CVStackEnvironment } from "@/types/setup";

// async function getJobAnalysis(jobUrl: string) {
async function getJobAnalysis(jobUrl: string, env: CVStackEnvironment) {
  const scrapedData = await scrapeJobData(jobUrl);

  const extractedData = await extractData(
    scrapedData.description,
    scrapedData.company,
    scrapedData.location,
    "x-ai/grok-4-fast",
    env,
  );

  return extractedData;
}

export { getJobAnalysis };
