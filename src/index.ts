// External imports
import { Command } from "commander";

// Internal imports
import { checkSetupStatus, performSetup } from "./core/setup";
import { getEnv } from "./consts";

function createCLI(appVersion: string, appDescription: string): Command {
  const app = new Command("cvstack")
    .description(appDescription)
    .version(appVersion)
    .showSuggestionAfterError(true)
    // .addHelpText("beforeAll", getBanner())
    .allowExcessArguments(true)
    .alias("cvs");

  // add other commands here
  app.action(async () => {
    await ensureSetup();
    // Now it's safe to access env after setup
    const env = getEnv();
    console.log("App working: OPENROUTER_API_KEY: ", env.OPENROUTER_API_KEY);
  });

  return app;
}

// Auto-setup middleware - runs before any command that needs setup
export async function ensureSetup(): Promise<boolean> {
  const status = checkSetupStatus();

  if (!status.isFullySetup) {
    console.log("⚠️  CVStack requires initial setup...");
    console.log("Running setup automatically...");

    // todo: can clean this up later
    const result = await performSetup();

    if (result.isErr()) {
      console.error("❌ Auto-setup failed:", result.error.message);
      console.log("Please run `cvstack setup` manually.");
      return false;
    }

    console.log("✓ Auto-setup completed!");
  }

  return true;
}

export default createCLI;
