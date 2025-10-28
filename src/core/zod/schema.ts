import z from "zod";

const jobUrlOptions = [
  "https://linkedin.com/jobs/view",
  "https://www.linkedin.com/jobs/view",
];

export const urlSchema = z.url("Must be a valid Url");

export const jobUrlSchema = urlSchema.refine(
  (val) => jobUrlOptions.some((baseUrl) => val.startsWith(baseUrl)),
  `Must be a valid Linkedin job posting Url`,
);

export const extractedJobInfoSchema = z.object({
  title: z.string().nonempty(),
  companyName: z.string().nonempty(),
  workArrangement: z.enum(["on-site", "hybrid", "remote"]),
  jobType: z.enum(["full-time", "part-time", "contract", "internship"]),
  locationCity: z.string(),
  locationCountry: z.string().nonempty(),
  descriptionText: z.string().nonempty(),
  requiredQualifications: z.array(z.string().nonempty()),
  preferredQualifications: z.array(z.string().nonempty()),
  technicalSkills: z.array(z.string().nonempty()),
  nonTechnicalSkills: z.array(z.string().nonempty()),
  salaryMin: z.number().nonnegative(),
  salaryMax: z.number().nonnegative(),
  salaryCurrency: z.enum(["USD", "CAD", "INR", "EUR"]),
  immigrationRequirements: z.string(),
  benefits: z.array(z.string().nonempty()),
  linguisticRequirements: z.string(),
  postedDate: z.string(),
});

export const scrapedJobSchema = z.object({
  url: jobUrlSchema,
  job_id: z.coerce.number(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string().nonempty(),
  word_count: z.number().gt(0),
  char_count: z.number().gt(0),
});
