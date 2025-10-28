#!usr/bin/env bun

import { SafeExec } from "catchresult";

import createCLI, { ensureSetup } from "@/index";
import { version, description } from "@/../package.json";
import { ensureScraperInstalled } from "@/core/install-scraper";
import type { CommanderError } from "commander";

const exec = new SafeExec().catchAll((err, ctx) => {
  console.error("A commander error occurred: ", err);
  console.error("Context: ", ctx);
  process.exit(1);
});

async function main() {
  try {
    const cvstack = await createCLI(version, description);
    const parseAsync = exec.getSafeFnAsync(
      () => cvstack.parseAsync(process.argv),
      {
        location: "parseAsync",
      },
    );
    // await cvstack.parseAsync(process.argv);
    // await parseAsync(process.argv, { from: "node" });
    await parseAsync();
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
