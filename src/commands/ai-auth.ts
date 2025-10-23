// External imports
import { Command } from "commander";

// Internal imports
import { ApiKeySchema, ENV_FILEPATH } from "@/consts";
import { passwordPrompt } from "@/core/prompt";
import { parseSchema } from "@/core/zod/parse";
import { unwrapAsync } from "@/core/unwrap";
import { writeFile } from "@/core/file";
import log from "@/core/logger";

const aiAuth = new Command("ai-auth")
  .description("Supply OpenRouter API key for cvstack.")
  .action(async () => {
    const updatedApiKey = await passwordPrompt(
      "Enter your OpenRouter API key: ",
    );

    const validatedResult = parseSchema(ApiKeySchema, updatedApiKey, "cli");

    const envContent = `# Environment variables for cvstack
OPENROUTER_API_KEY="${validatedResult}"
    `;

    await unwrapAsync(writeFile(ENV_FILEPATH, envContent)).then(() =>
      log.info("Updated API key!"),
    );
  });

export { aiAuth as default };
