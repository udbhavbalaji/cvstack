#!usr/bin/env bun

import createCLI from "@/index";
import { config as defineEnv } from "dotenv";
import { version, description } from "./package.json";
// import { ENV_FILEPATH } from "@/consts";
//
// // Load environment variables
// defineEnv({ path: ENV_FILEPATH, quiet: true, override: true });

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
  main();
}
