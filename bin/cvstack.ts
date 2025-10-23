#!usr/bin/env bun

import createCLI, { ensureSetup } from "@/index";
import { version, description } from "@/../package.json";
import { ensureScraperInstalled } from "@/core/install-scraper";

async function main() {
  try {
    const cvstack = await createCLI(version, description);
    await cvstack.parseAsync(process.argv);
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    process.exit(1);
  }
}

if (import.meta.main) {
  await ensureScraperInstalled();
  await ensureSetup();
  main();
}
