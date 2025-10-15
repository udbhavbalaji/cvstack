export interface JobStats {
  total: number;
  byStatus: Record<string, number>;
  byWorkArrangement: Record<string, number>;
  byJobType: Record<string, number>;
  byCompany: Record<string, number>;
  byLocation: Record<string, number>;
  byAppMethod: Record<string, number>;
  starred: number;
  withReferral: number;
  salaryStats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    currency: Record<string, number>;
  };
  timeStats: {
    thisWeek: number;
    thisMonth: number;
    last30Days: number;
    oldest: string | null;
    newest: string | null;
  };
  topSkills: {
    technical: Record<string, number>;
    nonTechnical: Record<string, number>;
  };
}
