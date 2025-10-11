#!usr/bin/env bun

import createCLI from "@/index";
import { version, description } from "./package.json";

const app = createCLI(version, description);

app.parse(process.argv);
