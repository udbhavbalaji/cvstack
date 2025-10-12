// External imports
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Internal imports
import { appStatuses } from "../../consts";

export const jobsTable = sqliteTable("jobs", {
  jobId: integer("job_id").primaryKey(),
  title: text().notNull(),
  companyName: text("company_name").notNull(),
  workArrangement: text("work_arrangement", {
    enum: ["on-site", "hybrid", "remote"],
  }).notNull(),
  jobType: text("job_type", {
    enum: ["full-time", "part-time", "contract", "internship"],
  }).notNull(),
  locationCity: text("location_city"),
  locationCountry: text("location_country").notNull(),
  descriptionText: blob("description_text").$type<string>().notNull(),
  requiredQualifications: text("required_qualifications", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  preferredQualifications: text("preferred_qualifications", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  technicalSkills: text("technical_skills", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  nonTechnicalSkills: text("non_technical_skills", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency", {
    enum: ["USD", "CAD", "INR", "EUR"],
  }).notNull(),
  immigrationRequirements: text("immigration_requirements").notNull(),
  linguisticRequirements: text("linguistic_requirements").notNull(),
  benefits: text({ mode: "json" }).$type<string[]>().notNull(),
  postedDate: text("posted_date"),
  referral: text(),
  appMethod: text("app_method", {
    enum: ["Linkedin", "Company's Job Portal", "Other"],
  }).notNull(),
  applicationLink: text("application_link").notNull(),
  applicationStatus: text("application_status", {
    enum: appStatuses,
  }).notNull(),
  dateApplied: text("date_applied").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
  starred: integer({ mode: "boolean" }).notNull().default(false),
});
