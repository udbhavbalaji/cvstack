#!/usr/bin/env node
//
// const isBun = typeof Bun !== undefined && Bun.version;
//
// if (!isBun) {
//   console.error(`
// ❌ This CLI requires Bun to run.
//
// You can install Bun by running:
//
//   curl -fsSL https://bun.sh/install | bash
//        (or)
//   npm install -g bun
//
//   > Read more at: https://bun.com/
//
// Once installed, you can use cvstack by running:
//   cvstack|cvs --help
// `);
//   process.exit(1);
// }
//
// import createCLI from "../src/index";
// import { version, description } from "@/../package.json";
//
// async function main() {
//   try {
//     const cvstack = await createCLI(version, description);
//     await cvstack.parseAsync(process.argv);
//   } catch (err) {
//     console.error("An unexpected error occurred:", err);
//     process.exit(1);
//   }
// }
//
// if (import.meta.main) {
//   main();
// }

// #!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

// Try to find bun
try {
  execFileSync("bun", ["--version"], { stdio: "ignore" });

  // If bun exists, run the bun entry
  const bunEntry = join(import.meta.dirname, "cli.js");
  // const bunEntry = join(import.meta.dirname, "run-bun.js");
  const args = process.argv.slice(2);
  const result = execFileSync("bun", [bunEntry, ...args], { stdio: "inherit" });
  // @ts-ignore
  process.exit(result?.status ?? 0);
} catch {
  // console.error("❌ This CLI requires Bun to run.");
  // console.error(
  //   "👉 Install Bun by running: curl -fsSL https://bun.sh/install | bash",
  // );
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
