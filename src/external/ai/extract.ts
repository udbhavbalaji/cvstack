// External imports
import yoctoSpinner from "yocto-spinner";
import { Result, ResultAsync } from "neverthrow";
import { OpenAI } from "openai";
import chalk from "chalk";
import z from "zod";

// Internal imports
// import { getEnv } from "@/consts";
import type { CVStackModels } from "@/types/ai";
import { extractedJobInfoSchema } from "@/core/zod/schema";
import { parseSchema } from "@/core/zod/parse";
import { crash } from "@/core/terminate";
import errors from "@/core/errors";
import type { CVStackError } from "@/types/errors";
import type { CVStackEnvironment } from "@/types/setup";
import { unwrap } from "@/core/unwrap";

// const env = getEnv();
//
// if (!env) {
//   console.error("env not set");
//   process.exit(1);
// }

const aiSpinner = yoctoSpinner({
  color: "cyan",
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
});

let _extractionClient: Result<OpenAI, CVStackError> | null = null;

function getExtractionClient(env: CVStackEnvironment) {
  if (!_extractionClient) {
    _extractionClient = Result.fromThrowable(
      () =>
        new OpenAI({
          apiKey: env.OPENROUTER_API_KEY,
          baseURL: "https://openrouter.ai/api/v1",
        }),
      (err) => errors.handle.aiError(err, "getExtractionClient"),
    )();
    // return _extractionClient;
  }
  return _extractionClient;
}

// const extractionClient = new OpenAI({
//   apiKey: env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
// });

async function _extractData(
  description: string,
  company: string,
  location: string,
  model: CVStackModels,
  env: CVStackEnvironment,
) {
  const extractionClient = unwrap(getExtractionClient(env));

  const response = await extractionClient.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant and an expert in text analysis and data extraction. Your task is to analyze a given job description and extract important information from it. I want the returned output structured as json. Don't add any markdown formatting. I want just the JSON object. Where you cannot find a value, return an empty string. For the salary fields, if you cannot find a value, return 0`,
      },
      {
        role: "user",
        content: `Extract important information from the following job description: ${description}; Company: ${company}; Location: ${location}`,
      },
    ],
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extractedJob",
        schema: z.toJSONSchema(extractedJobInfoSchema),
        strict: true,
      },
    },
  });

  if (response.choices.length <= 0) {
    throw new Error("No response from OpenRouter");
  }

  const validatedData = parseSchema(
    extractedJobInfoSchema,
    JSON.parse(response.choices[0]!.message.content!),
    "ai",
  );

  return validatedData;
}

const extractData = async (
  description: string,
  company: string,
  location: string,
  model: CVStackModels,
  env: CVStackEnvironment,
) => {
  aiSpinner.start(`AI is working its magic...\n\n`);

  setTimeout(() => {
    aiSpinner.color = "green";
  }, 5000);

  const textUpdateTimeout = setTimeout(() => {
    aiSpinner.color = "yellow";
  }, 10000);

  const res = await extractDataWrapped(
    description,
    company,
    location,
    model,
    env,
  );

  clearTimeout(textUpdateTimeout);

  if (res.isErr()) {
    aiSpinner.error(chalk.red("Damn, even AI couldn't do its job!"));
    return crash(res);
  }

  aiSpinner.success(chalk.cyan("AI extracted the information successfully"));

  return res.value;
};

const extractDataWrapped = (
  description: string,
  company: string,
  location: string,
  model: CVStackModels,
  env: CVStackEnvironment,
) =>
  ResultAsync.fromPromise(
    _extractData(description, company, location, model, env),
    (err) => errors.handle.aiError(err, "extractData", { description, model }),
  );

export { extractData as default };
