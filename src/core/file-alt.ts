import fs from "node:fs";
import safeExec from "./catchresult";
import yoctoSpinner from "yocto-spinner";

const spinner = yoctoSpinner({
  color: "cyan",
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
});

const writeFile = safeExec.getSafeFn(fs.appendFileSync, {
  location: "writeFile",
});

const createDirectories = safeExec.getSafeFn(
  (dirs: string[]) => {
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        spinner.start(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
        spinner.success(`Created: ${dir}`);
      }
    }
  },
  {
    location: "createDirectories",
    spinner,
    spinnerErrorMessage: "Failed to create directories.",
  },
);

export { writeFile, createDirectories };
