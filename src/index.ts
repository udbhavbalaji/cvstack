// External imports
import { Command } from "commander";

// Internal imports
import { checkSetupStatus, performSetup } from "./core/setup";
import { getBanner } from "./core/banner";
import { setupCustomHelp } from "./core/help";
import log from "./core/logger";
import add from "./commands/add";
import aiAuth from "./commands/ai-auth";
import apply from "./commands/apply";

async function createCLI(
  appVersion: string,
  appDescription: string,
): Promise<Command> {
  const app = new Command("cvstack")
    .description(appDescription)
    .version(appVersion)
    .showSuggestionAfterError(true)
    .addHelpText("beforeAll", getBanner())
    .allowExcessArguments(true)
    .alias("cvs");

  // Adding custom help
  setupCustomHelp(app);

  await ensureSetup();

  // add other commands here
  app.addCommand(add);
  app.addCommand(apply);
  app.addCommand(aiAuth);

  app.action(async () => {
    await ensureSetup();
    // Now it's safe to access env after setup
    app.outputHelp();
    if (app.args.length === 0) {
      return;
    }
    log.error(`Invalid command: ${app.args.join(" ")}`);
    //
    // const env = getEnv();
    // console.log("App working: OPENROUTER_API_KEY: ", env.OPENROUTER_API_KEY);
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
