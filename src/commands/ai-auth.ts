import { Command } from "commander";
import { ensureSetup } from "@/index";
import { passwordPrompt } from "@/core/prompt";
import { parseSchema } from "@/core/zod/parse";
import { ApiKeySchema } from "@/consts";
import { writeEnvFile } from "@/core/file";
import { unwrapAsync } from "@/core/unwrap";
import log from "@/core/logger";

const aiAuth = new Command("ai-auth")
  .description("Supply OpenRouter API key for cvstack.")
  .action(async () => {
    await ensureSetup();

    const updatedApiKey = await passwordPrompt(
      "Enter your OpenRouter API key: ",
    );

    const validatedResult = parseSchema(ApiKeySchema, updatedApiKey, "cli");

    const envContent = `# Environment variables for cvstack
OPENROUTER_API_KEY="${validatedResult}"
    `;

    await unwrapAsync(writeEnvFile(envContent)).then(() =>
      log.info("Updated API key!"),
    );
  });

export { aiAuth as default };
