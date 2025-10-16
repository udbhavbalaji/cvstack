import { $ } from "bun";

await $`bun build bin/entry.ts bin/cli.ts --outdir dist/bin --minify --sourcemap --target bun`;
// await $`bun build bin/cli.ts --outdir dist/bin --minify --sourcemap --target bun`;
await $`mkdir -p dist/drizzle && cp -R drizzle dist`;
await $`cp -R cvstack-scraper/dist/cvstack-scraper dist/bin`;
