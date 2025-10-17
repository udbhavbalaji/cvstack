#!/usr/bin/env node

import { execFileSync } from "child_process";
import { join } from "path";

// Try to find bun
try {
  execFileSync("bun", ["--version"], { stdio: "ignore" });

  // If bun exists, run the bun entry
  const bunEntry = join(import.meta.dirname, "cvstack.js");
  const args = process.argv.slice(2);
  const result = execFileSync(bunEntry, [...args], { stdio: "inherit" });
  // @ts-ignore
  process.exit(result?.status ?? 0);
} catch {
  console.error(`
  ❌ This CLI requires Bun to run.

  You can install Bun by running:

    curl -fsSL https://bun.sh/install | bash
         (or)
    npm install -g bun

    > Read more at: https://bun.com/

  Once installed, you can use cvstack by running:
    cvstack|cvs --help
  `);
  process.exit(1);
}
