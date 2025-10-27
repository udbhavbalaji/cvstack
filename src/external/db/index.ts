import errors from "@/core/errors";
import { unwrap, unwrapAsync } from "@/core/unwrap";
import { getDatabase } from "@/external/db/client";
import type {
  ApplicationStatus,
  InsertJobModel,
  SelectJobModel,
  UpdateJobDetailsModel,
} from "@/types/db";
import { jobsTable } from "@/external/db/schema";
import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import safeExec from "@/core/catchresult";

// const dbClient = unwrap(getDatabase());

function getDbApi() {
  const dbClient = unwrap(getDatabase());

  const _db = {
    query: {
      getJob: async (jobId: number): Promise<SelectJobModel> => {
        const job = await dbClient.query.jobsTable.findFirst({
          where: (jobs, { eq }) => eq(jobs.jobId, jobId),
        });
        if (!job) {
          // throw new CVDatabaseError("Job not found", "query", true, { jobId });
          throw errors.create.databaseError(
            "Job not found",
            true,
            "db:query:getJob",
            {
              jobId,
            },
          );
        }

        return job;
      },
      exist: async (jobId: number) => {
        const job = await dbClient.query.jobsTable.findFirst({
          columns: { jobId: true, applicationStatus: true },
          where: (jobs, { eq }) => eq(jobs.jobId, jobId),
        });

        if (job) {
          return { applicationStatus: job.applicationStatus };
        } else return false;
      },
      getAll: async () => {
        return await dbClient.query.jobsTable.findMany();
      },
      getAllWhere: async (where: Partial<typeof jobsTable.$inferSelect>) => {
        return await dbClient.query.jobsTable.findMany({
          where: (fields, { eq, and }) => {
            const filters = Object.entries(where)
              .filter((_, value) => value !== undefined)
              .map(([key, value]) => eq((fields as any)[key], value));

            return filters.length > 0 ? and(...filters) : undefined;
          },
        });
      },
    },
    insert: (job: InsertJobModel) => {
      return dbClient.insert(jobsTable).values(job);
    },
    update: {
      status: async (jobId: number, status: ApplicationStatus) => {
        return await dbClient
          .update(jobsTable)
          .set({ applicationStatus: status })
          .where(eq(jobsTable.jobId, jobId));
      },
      toggleStarred: async (jobId: number, currentStarred: boolean) => {
        return await dbClient
          .update(jobsTable)
          .set({ starred: !currentStarred })
          .where(eq(jobsTable.jobId, jobId));
      },
      details: async (jobId: number, set: UpdateJobDetailsModel) => {
        return await dbClient
          .update(jobsTable)
          .set(set)
          .where(eq(jobsTable.jobId, jobId));
      },
    },
    delete: {
      id: async (jobId: number) => {
        return await dbClient
          .delete(jobsTable)
          .where(eq(jobsTable.jobId, jobId));
      },
      all: async () => {
        return await dbClient.delete(jobsTable);
      },
      where: async () => {},
    },
  };
  const db = {
    query: {
      getJob: async (jobId: number) => {
        const res = await ResultAsync.fromPromise(
          _db.query.getJob(jobId),
          (err) =>
            errors.handle.databaseError(err, "db:query:getJob", { jobId }),
        );

        if (res.isErr()) {
          return undefined;
        }

        return res.value;
      },
      getJobOrThrow: safeExec.getSafeFnAsync(_db.query.getJob, {
        location: "db:query:getJobOrThrow",
      }),
      // unwrapAsync(
      //   ResultAsync.fromPromise(_db.query.getJob(jobId), (err) =>
      //     errors.handle.databaseError(err, "db:query:getJobOrThrow", {
      //       jobId,
      //     }),
      //   ),
      //   `db:query:getJobOrThrow:id=${jobId}`,
      // ),
      exist: safeExec.getSafeFnAsync(_db.query.exist, {
        location: "db:query:exist",
      }),
      // exist: async (jobId: number) =>
      //   unwrapAsync(
      //     ResultAsync.fromPromise(_db.query.exist(jobId), (err) =>
      //       errors.handle.databaseError(err, "db:exist", { jobId }),
      //     ),
      //     "db:exist:${jobId}",
      //   ),
      getAll: safeExec.getSafeFnAsync(_db.query.getAll, {
        location: "sb:query:getAll",
      }),
      // getAll: async () =>
      //   unwrapAsync(
      //     ResultAsync.fromPromise(_db.query.getAll(), (err) =>
      //       errors.handle.databaseError(err, "db:getAll"),
      //     ),
      //     "db:getAll",
      //   ),
      getAllWhere: safeExec.getSafeFnAsync(_db.query.getAllWhere, {
        location: "db:query:getAllWhere",
      }),
      //   getAllWhere: (where: Partial<typeof jobsTable.$inferSelect>) =>
      //     unwrapAsync(
      //       ResultAsync.fromPromise(_db.query.getAllWhere(where), (err) =>
      //         errors.handle.databaseError(err, "getAllWhere", { where }),
      //       ),
      //       "getAllWhere",
      //     ),
    },
    insert: safeExec.getSafeFnAsync(_db.insert, { location: "db:insert" }),
    // insert: (job: InsertJobModel) =>
    //   unwrapAsync(
    //     ResultAsync.fromPromise(_db.insert(job), (err) =>
    //       errors.handle.databaseError(err, "db:insert", { job }),
    //     ),
    //   ),
    update: {
      status: (jobId: number, status: ApplicationStatus) =>
        ResultAsync.fromPromise(_db.update.status(jobId, status), (err) =>
          errors.handle.databaseError(err, "db:update:status", {
            jobId,
            status,
          }),
        ),
      toggleStarred: safeExec.getSafeFnAsync(_db.update.toggleStarred, {
        location: "db:update:toggleStarred",
      }),
      // toggleStarred: (jobId: number, currentStarred: boolean) =>
      //   unwrapAsync(
      //     ResultAsync.fromPromise(
      //       _db.update.toggleStarred(jobId, currentStarred),
      //       (err) =>
      //         errors.handle.databaseError(err, "db:query:toggleStarred", {
      //           jobId,
      //           currentStarred,
      //         }),
      //     ),
      //     `db:query:toggleStarred:id=${jobId}:current_starred=${currentStarred}`,
      //   ),
      details: safeExec.getSafeFnAsync(_db.update.details, {
        location: "db:update:details",
      }),
      // details: (jobId: number, set: UpdateJobDetailsModel) =>
      //   ResultAsync.fromPromise(_db.update.details(jobId, set), (err) =>
      //     errors.handle.databaseError(err, "db:update:details", {
      //       jobId,
      //       set,
      //     }),
      //   ),
    },
    delete: {
      id: safeExec.getSafeFnAsync(_db.delete.id, { location: "db:delete:id" }),
      // id: (jobId: number) =>
      //   unwrapAsync(
      //     ResultAsync.fromPromise(_db.delete.id(jobId), (err) =>
      //       errors.handle.databaseError(err, "db:delete:id", { jobId }),
      //     ),
      //     `db:delete:jobId=${jobId}`,
      //   ),
      all: safeExec.getSafeFnAsync(_db.delete.all, {
        location: "db:delete:all",
      }),
      // all: () =>
      //   unwrapAsync(
      //     ResultAsync.fromPromise(_db.delete.all(), (err) =>
      //       errors.handle.databaseError(err, "db:delete:all"),
      //     ),
      //     "db:delete:all",
      //   ),
    },
  };

  return db;
}

// const _db = {
//   query: {
//     getJob: async (jobId: number): Promise<SelectJobModel> => {
//       const job = await dbClient.query.jobsTable.findFirst({
//         where: (jobs, { eq }) => eq(jobs.jobId, jobId),
//       });
//       if (!job) {
//         // throw new CVDatabaseError("Job not found", "query", true, { jobId });
//         throw errors.create.databaseError(
//           "Job not found",
//           true,
//           "db:query:getJob",
//           {
//             jobId,
//           },
//         );
//       }
//
//       return job;
//     },
//     exist: async (jobId: number) => {
//       const job = await dbClient.query.jobsTable.findFirst({
//         columns: { jobId: true, applicationStatus: true },
//         where: (jobs, { eq }) => eq(jobs.jobId, jobId),
//       });
//
//       if (job) {
//         return { applicationStatus: job.applicationStatus };
//       } else return false;
//     },
//     getAll: async () => {
//       return await dbClient.query.jobsTable.findMany();
//     },
//     getAllWhere: async (where: Partial<typeof jobsTable.$inferSelect>) => {
//       return await dbClient.query.jobsTable.findMany({
//         where: (fields, { eq, and }) => {
//           const filters = Object.entries(where)
//             .filter((_, value) => value !== undefined)
//             .map(([key, value]) => eq((fields as any)[key], value));
//
//           return filters.length > 0 ? and(...filters) : undefined;
//         },
//       });
//     },
//   },
//   insert: (job: InsertJobModel) => {
//     return dbClient.insert(jobsTable).values(job);
//   },
//   update: {
//     status: async (jobId: number, status: ApplicationStatus) => {
//       return await dbClient
//         .update(jobsTable)
//         .set({ applicationStatus: status })
//         .where(eq(jobsTable.jobId, jobId));
//     },
//     toggleStarred: async (jobId: number, currentStarred: boolean) => {
//       return await dbClient
//         .update(jobsTable)
//         .set({ starred: !currentStarred })
//         .where(eq(jobsTable.jobId, jobId));
//     },
//     details: async (jobId: number, set: UpdateJobDetailsModel) => {
//       return await dbClient
//         .update(jobsTable)
//         .set(set)
//         .where(eq(jobsTable.jobId, jobId));
//     },
//   },
//   delete: {
//     id: async (jobId: number) => {
//       return await dbClient.delete(jobsTable).where(eq(jobsTable.jobId, jobId));
//     },
//     all: async () => {
//       return await dbClient.delete(jobsTable);
//     },
//     where: async () => { },
//   },
// };
//
// const db = {
//   query: {
//     getJob: async (jobId: number) => {
//       const res = await ResultAsync.fromPromise(
//         _db.query.getJob(jobId),
//         (err) => errors.handle.databaseError(err, "db:query:getJob", { jobId }),
//       );
//
//       if (res.isErr()) {
//         return undefined;
//       }
//
//       return res.value;
//     },
//     getJobOrThrow: (jobId: number) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.query.getJob(jobId), (err) =>
//           errors.handle.databaseError(err, "db:query:getJobOrThrow", { jobId }),
//         ),
//         `db:query:getJobOrThrow:id=${jobId}`,
//       ),
//     exist: async (jobId: number) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.query.exist(jobId), (err) =>
//           errors.handle.databaseError(err, "db:exist", { jobId }),
//         ),
//         "db:exist:${jobId}",
//       ),
//     getAll: async () =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.query.getAll(), (err) =>
//           errors.handle.databaseError(err, "db:getAll"),
//         ),
//         "db:getAll",
//       ),
//     getAllWhere: (where: Partial<typeof jobsTable.$inferSelect>) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.query.getAllWhere(where), (err) =>
//           errors.handle.databaseError(err, "getAllWhere", { where }),
//         ),
//         "getAllWhere",
//       ),
//   },
//   insert: (job: InsertJobModel) =>
//     unwrapAsync(
//       ResultAsync.fromPromise(_db.insert(job), (err) =>
//         errors.handle.databaseError(err, "db:insert", { job }),
//       ),
//     ),
//   update: {
//     status: (jobId: number, status: ApplicationStatus) =>
//       ResultAsync.fromPromise(_db.update.status(jobId, status), (err) =>
//         errors.handle.databaseError(err, "db:update:status", { jobId, status }),
//       ),
//     toggleStarred: (jobId: number, currentStarred: boolean) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(
//           _db.update.toggleStarred(jobId, currentStarred),
//           (err) =>
//             errors.handle.databaseError(err, "db:query:toggleStarred", {
//               jobId,
//               currentStarred,
//             }),
//         ),
//         `db:query:toggleStarred:id=${jobId}:current_starred=${currentStarred}`,
//       ),
//     details: (jobId: number, set: UpdateJobDetailsModel) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.update.details(jobId, set), (err) =>
//           errors.handle.databaseError(err, "db:update:details", { jobId, set }),
//         ),
//         "db:update:details",
//       ),
//   },
//   delete: {
//     id: (jobId: number) =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.delete.id(jobId), (err) =>
//           errors.handle.databaseError(err, "db:delete:id", { jobId }),
//         ),
//         `db:delete:jobId=${jobId}`,
//       ),
//     all: () =>
//       unwrapAsync(
//         ResultAsync.fromPromise(_db.delete.all(), (err) =>
//           errors.handle.databaseError(err, "db:delete:all"),
//         ),
//         "db:delete:all",
//       ),
//   },
// };

let db: ReturnType<typeof getDbApi> | null = null;

function getDatabaseAPI() {
  if (!db) {
    db = getDbApi();
  }

  return db;
}

export default getDatabaseAPI;
