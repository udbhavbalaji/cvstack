// External imports
import { Command } from "commander";
import wrapAnsi from "wrap-ansi";
import chalk from "chalk";

const colours = {
  purple: "#8B5CF6",
  cyan: "#00D9FF",
  greenishCyan: "#42f593",
  lightGray: "#a1aba5",
  lighterGray: "#b5bab7",
  darkGray: "#3c3d3d",
  reddishPink: "#fa5050",
  reddishOrange: "#fa6950",
};

function getFullCommandName(cmd: Command): string {
  return cmd.parent
    ? getFullCommandName(cmd.parent) + " " + cmd.name()
    : cmd.name();
}

const INDENT = 22;
const LINE_WIDTH = 80;

export function wrapAndIndent(
  text: string,
  // nameLength: number,
  indent = INDENT,
  width = LINE_WIDTH,
): string {
  return wrapAnsi(text, width - indent, { hard: false })
    .split("\n")
    .map((line, idx) => (idx === 0 ? line : " ".repeat(indent) + line))
    .join("\n");
}

function formatHelp(cmd: Command): string {
  const commands = cmd.commands;
  const options = cmd.options;
  const args = (cmd as any)._args || [];
  const aliases = (cmd as any)._aliases || [];

  let help = "\n";
  // help += chalk.hex(colours.purple)("_".repeat(60)) + "\n\n";

  // Usage section
  help += chalk.hex(colours.cyan).bold("USAGE:\n");
  help +=
    "  " +
    chalk.hex(colours.greenishCyan)("$") +
    " " +
    chalk.hex(colours.cyan)(getFullCommandName(cmd));

  // Show aliases if they exist
  if (aliases.length > 0) {
    help +=
      chalk.hex(colours.cyan)("|") + chalk.hex(colours.cyan)(aliases.join("|"));
  }

  // Add command to usage
  if (commands.length > 0) {
    help += " " + chalk.hex(colours.cyan)("command");
  }

  // Add arguments to usage
  if (args.length > 0) {
    args.forEach((arg: any) => {
      const argName = arg.required ? `<${arg.name()}>` : `[${arg.name()}]`;
      help += " " + chalk.hex(colours.purple).italic(argName);
    });
  }

  help += " " + chalk.hex(colours.reddishOrange)("[options]");

  help += "\n\n";

  // Description
  if (cmd.description()) {
    help +=
      "  " +
      chalk.hex(colours.lighterGray)(wrapAndIndent(cmd.description(), 2, 100)) +
      "\n\n";
  }

  // Commands section
  if (commands.length > 0) {
    help += chalk.hex(colours.cyan).bold("COMMANDS:\n");

    const maxNameLength = Math.max(...commands.map((c) => c.name().length));

    commands.forEach((command) => {
      const name = command.name().padEnd(maxNameLength + 2);
      const desc = command.description() || "";
      help +=
        "  " +
        chalk.hex(colours.cyan)(name.padEnd(25)) +
        " " +
        chalk.hex(colours.lighterGray)(wrapAndIndent(desc, 28, 100)) +
        // chalk.hex(colours.lighterGray)(desc) +
        "\n";
    });
    help += "\n";
  }

  // Arguments section
  if (args.length > 0) {
    help += chalk.hex(colours.purple).bold("ARGUMENTS:\n");

    const maxArgLength = Math.max(...args.map((a: any) => a.name().length));

    args.forEach((arg: any) => {
      const argName = (
        arg.required ? `<${arg.name()}>` : `[${arg.name()}]`
      ).padEnd(maxArgLength + 2);
      const desc = arg.description || "";
      help +=
        "  " +
        chalk.hex(colours.purple)(argName.padEnd(25)) +
        " " +
        chalk.hex(colours.lighterGray)(wrapAndIndent(desc, 28, 100)) +
        // chalk.hex(colours.lighterGray)(desc) +
        "\n";
    });
    help += "\n";
  }

  // Options section
  help += chalk.hex(colours.reddishOrange).bold("OPTIONS:\n");
  if (options.length > 0) {
    const maxFlagsLength = Math.max(...options.map((o) => o.flags.length));

    options.forEach((option) => {
      const flags = option.flags.padEnd(maxFlagsLength + 2);
      const desc = option.description || "";
      help +=
        "  " +
        chalk.hex(colours.reddishOrange)(flags.padEnd(25)) +
        " " +
        chalk.hex(colours.lighterGray)(wrapAndIndent(desc, 28, 100)) +
        // chalk.hex(colours.lighterGray)(desc) +
        "\n";
    });
  }
  help +=
    "  " +
    chalk.hex(colours.reddishOrange)("-h, --help".padEnd(25)) +
    " " +
    chalk.hex(colours.lighterGray)("Show the help menu") +
    "\n";
  help += "\n";

  // Examples section (only show for main command)
  if (cmd.parent === null) {
    help += chalk.hex(colours.cyan).bold("EXAMPLES:\n");
    help +=
      "  " +
      chalk.hex(colours.greenishCyan)("$") +
      " " +
      chalk.hex(colours.cyan)(
        `${cmd.name()} apply -u https://www.linkedin.com/jobs/view/1234567890`,
      ) +
      "          " +
      chalk.hex(colours.lightGray)("# Apply for a job!\n");
    help +=
      "  " +
      chalk.hex(colours.greenishCyan)("$") +
      " " +
      chalk.hex(colours.cyan)(`${cmd.name()} stats -d`) +
      "         " +
      chalk.hex(colours.lightGray)(
        "# View your job application stats in detail\n",
      );
    help +=
      "  " +
      chalk.hex(colours.greenishCyan)("$") +
      " " +
      chalk.hex(colours.cyan)(`${cmd.name()} search`) +
      "        " +
      chalk.hex(colours.lightGray)(
        "# Search for a job to perform an action on it\n",
      );
    help += "\n";
  }

  return help;
}

function setupCustomHelp(program: Command): void {
  // Override the help display for the main program
  program.configureHelp({
    formatHelp: (cmd) => formatHelp(cmd),
  });

  // Override addCommand to automatically apply custom help
  const originalAddCommand = program.addCommand.bind(program);
  program.addCommand = function (cmd: Command): Command {
    cmd.configureHelp({
      formatHelp: (c) => formatHelp(c),
    });
    return originalAddCommand(cmd);
  };

  // Add custom help option with better styling
  program.helpOption("-h, --help", "Display help for command");
}

// Helper function to apply custom help to a command (optional, for manual use)
function applyCustomHelp(command: Command): Command {
  command.configureHelp({
    formatHelp: (cmd) => formatHelp(cmd),
  });
  return command;
}

export { setupCustomHelp, applyCustomHelp };
