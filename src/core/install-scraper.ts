// External imports
import { PYTHON_EXEC_PROD, SCRAPER_RELEASE_URL, ZIP_PATH } from "@/consts";
import { $ } from "bun";
import fs from "node:fs";
import path from "node:path";
import { prompts } from "./prompt";
import chalk from "chalk";

const BINARY_DIR = path.dirname(path.dirname(PYTHON_EXEC_PROD));

export async function ensureScraperInstalled() {
  if (fs.existsSync(PYTHON_EXEC_PROD)) {
    return;
  }

  const userConfirmed = await prompts.confirm(
    "CvStack requires a job scraper tool. Do you want to download it now?",
    true,
  );

  if (!userConfirmed) {
    console.error(chalk.yellow("warn: Cancelled."));
    process.exit(0);
  }

  console.log("Scraper not found. Downloading...");

  try {
    // ensure dist folder exists
    await $`mkdir -p ${BINARY_DIR}`;
    // await $`mkdir -p ${path.dirname(PYTHON_EXEC_PROD)}`;

    // Download zip
    await $`curl -L -o ${ZIP_PATH} ${SCRAPER_RELEASE_URL}`;
    console.log("✅ Download complete.");

    // Unzip
    await $`unzip -o ${ZIP_PATH} -d ${BINARY_DIR}`.quiet();
    // await $`unzip -o ${ZIP_PATH} -d ${path.dirname(PYTHON_EXEC_PROD)}`;
    console.log("✅ Exctraction complete.");

    // Delete zip
    await $`rm ${ZIP_PATH}`;
    console.log("✅ Cleanup complete.");

    // Make binary executable
    await $`chmod +x ${PYTHON_EXEC_PROD}`;
  } catch (err) {
    console.error("❌ Failed to download or extract scraper binary:", err);
    process.exit(1);
  }
}
