// External imports
import { Result } from "neverthrow";
import clipboard from "clipboardy";

// Internal imports
import errors from "@/core/errors";
import { unwrap } from "@/core/unwrap";
import { jobUrlSchema, urlSchema } from "@/core/zod/schema";
import type { SelectJobModel } from "@/types/db";

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function _unsafeExtractJobId(url: string) {
  const match = url.match(/\/jobs\/view\/(\d+)/);
  const res = match ? match[1] : undefined;
  if (res === undefined) throw new Error("Pattern didn't match");
  else {
    const numRes = parseInt(res);

    if (Number.isNaN(numRes)) throw new Error("Job Id has wrong format");

    return numRes;
  }
}

export function urlValidator(url: string, type: "linkedin" | "other") {
  const res =
    type === "linkedin"
      ? jobUrlSchema.safeParse(url)
      : urlSchema.safeParse(url);

  return res.success
    ? res.success
    : `${res.error.issues[0]?.path}: ${res.error.issues[0]?.message}`;
}

export async function copytoClipboard(text: string) {
  return await clipboard.write(text);
}

export function getPrintableJob(job: SelectJobModel) {
  const {
    jobId,
    applicationStatus,
    title,
    companyName,
    workArrangement,
    jobType,
    locationCity,
    locationCountry,
    salaryMin,
    salaryMax,
    salaryCurrency,
    starred,
  } = job;

  return {
    starred: starred ? "⭐" : "",
    jobId,
    title,
    companyName,
    jobDetails: `${jobType} - ${workArrangement}`,
    location: `${locationCity === "" ? "" : `${locationCity}, `}${locationCountry}`,
    salary: `Min: ${salaryMin === 0 ? "-" : salaryMin}; Max: ${salaryMax === 0 ? "-" : salaryMax} ${salaryCurrency}`,
    applicationStatus,
    dateApplied: job.dateApplied,
  };
}

export const extractJobId = (jobUrl: string) =>
  unwrap(
    Result.fromThrowable(
      (jobUrl: string) => _unsafeExtractJobId(jobUrl),
      (err) => errors.handle.unknownError(err, "extractJobId"),
    )(jobUrl),
  );
