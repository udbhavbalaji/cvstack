import { $ } from "bun";

await $`bun build bin/cli.ts bin/cvstack.ts --outdir dist/bin --minify --sourcemap --target bun`;
await $`mkdir -p dist/drizzle && cp -R drizzle dist`;
