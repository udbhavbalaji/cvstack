// External imports
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Internal imports
import { appStatuses } from "@/consts";
import type { jobsTable } from "@/external/db/schema";

export type SelectJobModel = InferSelectModel<typeof jobsTable>;

export type InsertJobModel = InferInsertModel<typeof jobsTable>;

export type ApplicationStatus = (typeof appStatuses)[number];

export type UpdateJobDetailsModel = Partial<
  Pick<
    InsertJobModel,
    | "title"
    | "companyName"
    | "locationCity"
    | "locationCountry"
    | "applicationStatus"
    | "referral"
    | "appMethod"
    | "applicationLink"
  >
>;
