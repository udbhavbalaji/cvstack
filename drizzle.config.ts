import type { Config } from "drizzle-kit";
import { MIGRATIONS_DIR } from "./src/consts";

export default {
  schema: "./src/external/db/schema.ts",
  out: MIGRATIONS_DIR,
  dialect: "sqlite",
} satisfies Config;
