#!usr/bin/env bun

import createCLI from "@/index";
import { version, description } from "./package.json";

async function main() {
  try {
    const cvstack = createCLI(version, description);
    await cvstack.parseAsync(process.argv);
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
