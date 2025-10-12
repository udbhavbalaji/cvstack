import type { InsertJobModel, SelectJobModel } from "./db";

export type PromptValidateFunction = (
  value: string,
) => string | boolean | Promise<string | boolean>;

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
