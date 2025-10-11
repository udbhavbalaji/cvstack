import { Command } from "commander";

function createCLI(appVersion: string, appDescription: string): Command {
  const app = new Command("cvstack")
    .description(appDescription)
    .version(appVersion)
    .showSuggestionAfterError(true)
    // .addHelpText("beforeAll", getBanner())
    .allowExcessArguments(true)
    .alias("cvs");

  // add other commands here
  app.action(() => console.log("App working"));

  return app;
}

export default createCLI;
