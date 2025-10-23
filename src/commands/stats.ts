// External imports
import { Command } from "commander";

// Internal imports
import type { JobStats } from "@/types/stats";
import { wrapAndIndent } from "@/core/help";
import getDb from "@/external/db";

const stats = new Command("stats")
  .description("Display comprehensive statistics about your job applications")
  .option("-d, --detailed", "Show detailed breakdown by category")
  .option("-t, --top <n>", "Number of top items to show in rankings", "5")
  .action(async (options) => {
    try {
      const db = getDb();

      const jobs = await db.query.getAll();

      if (jobs.length === 0) {
        console.log("\n📊 No job applications found in the database.\n");
        return;
      }

      const stats = calculateStats(jobs);
      displayStats(stats, options);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      process.exit(1);
    }
  });

function calculateStats(jobs: any[]): JobStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats: JobStats = {
    total: jobs.length,
    byStatus: {},
    byWorkArrangement: {},
    byJobType: {},
    byCompany: {},
    byLocation: {},
    byAppMethod: {},
    starred: 0,
    withReferral: 0,
    salaryStats: {
      min: null,
      max: null,
      avg: null,
      currency: {},
    },
    timeStats: {
      thisWeek: 0,
      thisMonth: 0,
      last30Days: 0,
      oldest: null,
      newest: null,
    },
    topSkills: {
      technical: {},
      nonTechnical: {},
    },
  };

  const salaries: number[] = [];
  const dates: Date[] = [];

  jobs.forEach((job) => {
    // Status
    stats.byStatus[job.applicationStatus] =
      (stats.byStatus[job.applicationStatus] || 0) + 1;

    // Work arrangement
    stats.byWorkArrangement[job.workArrangement] =
      (stats.byWorkArrangement[job.workArrangement] || 0) + 1;

    // Job type
    stats.byJobType[job.jobType] = (stats.byJobType[job.jobType] || 0) + 1;

    // Company
    stats.byCompany[job.companyName] =
      (stats.byCompany[job.companyName] || 0) + 1;

    // Location
    const location = job.locationCity
      ? `${job.locationCity}, ${job.locationCountry}`
      : job.locationCountry;
    stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;

    // Application method
    stats.byAppMethod[job.appMethod] =
      (stats.byAppMethod[job.appMethod] || 0) + 1;

    // Starred
    if (job.starred) stats.starred++;

    // Referral
    if (job.referral) stats.withReferral++;

    // Salary
    if (job.salaryMin !== null && job.salaryMax !== null) {
      const avgSalary = (job.salaryMin + job.salaryMax) / 2;
      salaries.push(avgSalary);
    }
    stats.salaryStats.currency[job.salaryCurrency] =
      (stats.salaryStats.currency[job.salaryCurrency] || 0) + 1;

    // Time stats
    const appliedDate = new Date(job.dateApplied);
    dates.push(appliedDate);

    if (appliedDate >= weekAgo) stats.timeStats.thisWeek++;
    if (appliedDate >= monthAgo) stats.timeStats.thisMonth++;
    stats.timeStats.last30Days = stats.timeStats.thisMonth;

    // Skills
    if (job.technicalSkills) {
      job.technicalSkills.forEach((skill: string) => {
        stats.topSkills.technical[skill] =
          (stats.topSkills.technical[skill] || 0) + 1;
      });
    }
    if (job.nonTechnicalSkills) {
      job.nonTechnicalSkills.forEach((skill: string) => {
        stats.topSkills.nonTechnical[skill] =
          (stats.topSkills.nonTechnical[skill] || 0) + 1;
      });
    }
  });

  // Calculate salary stats
  if (salaries.length > 0) {
    stats.salaryStats.min = Math.min(...salaries);
    stats.salaryStats.max = Math.max(...salaries);
    stats.salaryStats.avg =
      salaries.reduce((a, b) => a + b, 0) / salaries.length;
  }

  // Calculate date stats
  if (dates.length > 0) {
    dates.sort((a, b) => a.getTime() - b.getTime());
    stats.timeStats.oldest = dates[0]!.toLocaleDateString();
    stats.timeStats.newest = dates[dates.length - 1]!.toLocaleDateString();
  }

  return stats;
}

function displayStats(stats: JobStats, options: any) {
  const topN = parseInt(options.top) || 5;
  const detailed = options.detailed || false;

  console.log("\n" + "=".repeat(70));
  console.log("  📊 JOB APPLICATION TRACKER STATISTICS");
  console.log("=".repeat(70) + "\n");

  // Overview
  console.log("📈 Overview");
  console.log();
  console.log(`  ${"Total Applications".padEnd(50)}${stats.total}`);
  // console.log(`  Total Applications          ${stats.total}`);
  console.log(`  ${"Starred Applications".padEnd(50)}${stats.starred}`);
  // console.log(`  Starred Applications        ${stats.starred}`);
  console.log(
    `  ${"Applications with Referral".padEnd(50)}${stats.withReferral}`,
  );
  // console.log(`  Applications with Referral  ${stats.withReferral}`);
  console.log();

  // Application Status
  console.log("📋 Application Status");
  console.log();
  const sortedStatus = Object.entries(stats.byStatus).sort(
    ([, a], [, b]) => b - a,
  );
  const maxCount = Math.max(...sortedStatus.map(([, c]) => c));
  sortedStatus.forEach(([status, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    const barLength = Math.floor((count / maxCount) * 20);
    const bar = "█".repeat(barLength);
    console.log(
      `  ${status.padEnd(25)} ${count.toString().padStart(4)}  ${percentage.padStart(5)}%  ${bar}`,
    );
  });
  console.log();

  // Time Stats
  console.log("⏰ Application Timeline");
  console.log();
  console.log(
    `  ${"This Week".padEnd(25)} ${stats.timeStats.thisWeek.toString().padStart(4)}`,
  );
  console.log(
    `  ${"Last 30 Days".padEnd(25)} ${stats.timeStats.last30Days.toString().padStart(4)}`,
  );
  console.log(
    `  ${"Oldest".padEnd(25)} ${(stats.timeStats.oldest || "N/A").padStart(4)}`,
  );
  console.log(
    `  ${"Newest".padEnd(25)} ${(stats.timeStats.newest || "N/A").padStart(4)}`,
  );
  console.log();

  // Work Arrangement
  console.log("🏢 Work Arrangement");
  console.log();
  const maxWorkCount = Math.max(...Object.values(stats.byWorkArrangement));
  Object.entries(stats.byWorkArrangement)
    .sort(([, a], [, b]) => b - a)
    .forEach(([arr, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      const barLength = Math.floor((count / maxWorkCount) * 20);
      const bar = "█".repeat(barLength);
      console.log(
        `  ${arr.padEnd(25)} ${count.toString().padStart(4)}  ${percentage.padStart(5)}%  ${bar}`,
      );
    });
  console.log();

  // Job Type
  console.log("💼 Job Type");
  console.log();
  const maxJobTypeCount = Math.max(...Object.values(stats.byJobType));
  Object.entries(stats.byJobType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      const barLength = Math.floor((count / maxJobTypeCount) * 20);
      const bar = "█".repeat(barLength);
      console.log(
        `  ${type.padEnd(25)} ${count.toString().padStart(4)}  ${percentage.padStart(5)}%  ${bar}`,
      );
    });
  console.log();

  // Top Companies
  console.log(`🏆 Top ${topN} Companies`);
  console.log();
  Object.entries(stats.byCompany)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .forEach(([company, count], idx) => {
      console.log(
        `  ${(idx + 1).toString().padStart(2)}.  ${company.padEnd(40)} ${count.toString().padStart(4)}`,
      );
    });
  console.log();

  // Top Locations
  console.log(`📍 Top ${topN} Locations`);
  console.log();
  Object.entries(stats.byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .forEach(([location, count], idx) => {
      console.log(
        `  ${(idx + 1).toString().padStart(2)}.  ${location.padEnd(40)} ${count.toString().padStart(4)}`,
      );
    });
  console.log();

  // Application Method
  console.log("📝 Application Method");
  console.log();
  const maxMethodCount = Math.max(...Object.values(stats.byAppMethod));
  Object.entries(stats.byAppMethod)
    .sort(([, a], [, b]) => b - a)
    .forEach(([method, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      const barLength = Math.floor((count / maxMethodCount) * 20);
      const bar = "█".repeat(barLength);
      console.log(
        `  ${method.padEnd(30)} ${count.toString().padStart(4)}  ${percentage.padStart(5)}%  ${bar}`,
      );
    });
  console.log();

  // Salary Stats
  if (stats.salaryStats.avg !== null) {
    console.log("💰 Salary Statistics");
    console.log();
    console.log(
      `  Average Salary    ${Math.round(stats.salaryStats.avg).toLocaleString()}`,
    );
    console.log(
      `  Min Salary        ${Math.round(stats.salaryStats.min!).toLocaleString()}`,
    );
    console.log(
      `  Max Salary        ${Math.round(stats.salaryStats.max!).toLocaleString()}`,
    );
    console.log();
    console.log("  Currency Distribution:");
    Object.entries(stats.salaryStats.currency).forEach(([curr, count]) => {
      console.log(`    ${curr}  ${count}`);
    });
    console.log();
  }

  // Top Skills (if detailed)
  if (detailed) {
    console.log(`🛠️  Top ${topN} Technical Skills`);
    console.log();
    Object.entries(stats.topSkills.technical)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .forEach(([skill, count], idx) => {
        console.log(
          `  ${(idx + 1).toString().padStart(2)}.  ${skill.length > 35 ? padToWrappedText(wrapAndIndent(skill, 7, 40), 47) : skill.padEnd(40)} ${count.toString().padStart(4)}`,
          // `  ${(idx + 1).toString().padStart(2)}.  ${wrapAndIndent(skill, 6, 35).padEnd(40)} ${count.toString().padStart(4)}`,
          // `  ${(idx + 1).toString().padStart(2)}.  ${skill.padEnd(40)} ${count.toString().padStart(4)}`,
        );
      });
    console.log();

    console.log(`🤝 Top ${topN} Non-Technical Skills`);
    console.log();
    Object.entries(stats.topSkills.nonTechnical)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .forEach(([skill, count], idx) => {
        console.log(
          `  ${(idx + 1).toString().padStart(2)}.  ${skill.length > 35 ? padToWrappedText(wrapAndIndent(skill, 7, 40), 47) : skill.padEnd(40)} ${count.toString().padStart(4)}`,
          // `  ${(idx + 1).toString().padStart(2)}.  ${skill.padEnd(40)} ${count.toString().padStart(4)}`,
        );
      });
    console.log();
  }

  console.log("=".repeat(70) + "\n");
}

function padToWrappedText(wrappedText: string, width: number) {
  const lines = wrappedText.split("\n");

  return lines
    .map((line, idx) => (idx === lines.length - 1 ? line.padEnd(width) : line))
    .join("\n");
}

export default stats;
