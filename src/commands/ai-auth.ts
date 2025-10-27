// External imports
import { Command } from "commander";

// Internal imports
import { ApiKeySchema, ENV_FILEPATH } from "@/consts";
import { prompts } from "@/core/prompt";
import { parse } from "@/core/zod/parse";
import { unwrapAsync } from "@/core/unwrap";
import { writeFile } from "@/core/file-alt";
import log from "@/core/logger";

const aiAuth = new Command("ai-auth")
  .description("Supply OpenRouter API key for cvstack.")
  .action(async () => {
    const updatedApiKey = await prompts.password(
      "Enter your OpenRouter API key: ",
    );

    const validatedResult = parse.sync(ApiKeySchema, updatedApiKey, "cli");

    const envContent = `# Environment variables for cvstack
OPENROUTER_API_KEY="${validatedResult}"
    `;

    writeFile(ENV_FILEPATH, envContent);

    log.info("Updated API key!");
  });

export { aiAuth as default };
