export const analyticsRanges = ["30d", "90d", "12m", "YTD"] as const;
export type AnalyticsRange = (typeof analyticsRanges)[number];

export type RangeMetrics = {
  revenue: number;
  monthlyRevenue: number;
  completedProjects: number;
  avgCompletionDays: number;
  winRate: number;
  revisionRate: number;
  satisfaction: number;
  revenueSeries: { period: string; revenue: number; target: number; margin: number }[];
  completionSeries: { period: string; completed: number; avgDays: number }[];
  winRateSeries: { period: string; won: number; lost: number }[];
  satisfactionSeries: { period: string; score: number; revisions: number }[];
};

export const projectTypeMix = [
  { type: "Web Application", value: 34, revenue: 218400 },
  { type: "Mobile App", value: 21, revenue: 132900 },
  { type: "Game Development", value: 16, revenue: 104600 },
  { type: "Website", value: 14, revenue: 71200 },
  { type: "Automation / AI", value: 9, revenue: 68300 },
  { type: "Maintenance", value: 6, revenue: 42850 },
];

export const aiUsage = [
  { tool: "Claude", prompts: 1284, tokens: 18.4, hoursSaved: 212, cost: 486 },
  { tool: "Lovable", prompts: 968, tokens: 12.1, hoursSaved: 178, cost: 392 },
  { tool: "Base44", prompts: 412, tokens: 5.6, hoursSaved: 74, cost: 141 },
];

export const aiTrend = [
  { period: "Feb", Claude: 142, Lovable: 96, Base44: 30 },
  { period: "Mar", Claude: 168, Lovable: 118, Base44: 38 },
  { period: "Apr", Claude: 196, Lovable: 141, Base44: 51 },
  { period: "May", Claude: 214, Lovable: 168, Base44: 62 },
  { period: "Jun", Claude: 268, Lovable: 201, Base44: 88 },
  { period: "Jul", Claude: 296, Lovable: 244, Base44: 143 },
];

const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const weeks = ["W1", "W2", "W3", "W4"];
const quarters = ["2025 Q3", "2025 Q4", "2026 Q1", "2026 Q2", "2026 Q3"];

function build(
  labels: string[],
  base: number,
  step: number,
  seed: number,
): RangeMetrics["revenueSeries"] {
  return labels.map((period, i) => {
    const revenue = Math.round(base + step * i + ((i * seed) % 7) * 1100);
    return {
      period,
      revenue,
      target: Math.round(base + step * i * 0.92),
      margin: 34 + ((i * seed) % 9),
    };
  });
}

export const analyticsData: Record<AnalyticsRange, RangeMetrics> = {
  "30d": {
    revenue: 72400,
    monthlyRevenue: 72400,
    completedProjects: 2,
    avgCompletionDays: 46,
    winRate: 61,
    revisionRate: 12,
    satisfaction: 4.8,
    revenueSeries: build(weeks, 14200, 3100, 3),
    completionSeries: weeks.map((period, i) => ({ period, completed: [1, 0, 1, 2][i], avgDays: 52 - i * 2 })),
    winRateSeries: weeks.map((period, i) => ({ period, won: [3, 2, 4, 3][i], lost: [2, 3, 1, 2][i] })),
    satisfactionSeries: weeks.map((period, i) => ({ period, score: 4.6 + i * 0.06, revisions: [4, 3, 2, 2][i] })),
  },
  "90d": {
    revenue: 196800,
    monthlyRevenue: 65600,
    completedProjects: 5,
    avgCompletionDays: 52,
    winRate: 57,
    revisionRate: 15,
    satisfaction: 4.7,
    revenueSeries: build(months.slice(3), 52000, 9800, 5),
    completionSeries: months.slice(3).map((period, i) => ({ period, completed: [1, 2, 2][i], avgDays: 58 - i * 3 })),
    winRateSeries: months.slice(3).map((period, i) => ({ period, won: [7, 9, 11][i], lost: [6, 6, 8][i] })),
    satisfactionSeries: months.slice(3).map((period, i) => ({ period, score: [4.5, 4.7, 4.8][i], revisions: [9, 7, 6][i] })),
  },
  "12m": {
    revenue: 638250,
    monthlyRevenue: 53187,
    completedProjects: 14,
    avgCompletionDays: 61,
    winRate: 52,
    revisionRate: 18,
    satisfaction: 4.6,
    revenueSeries: build(quarters, 118000, 21500, 4),
    completionSeries: quarters.map((period, i) => ({ period, completed: [2, 3, 3, 4, 2][i], avgDays: 72 - i * 3 })),
    winRateSeries: quarters.map((period, i) => ({ period, won: [14, 17, 19, 24, 12][i], lost: [16, 15, 17, 19, 9][i] })),
    satisfactionSeries: quarters.map((period, i) => ({ period, score: [4.3, 4.4, 4.5, 4.7, 4.8][i], revisions: [21, 19, 17, 14, 8][i] })),
  },
  YTD: {
    revenue: 421900,
    monthlyRevenue: 60271,
    completedProjects: 9,
    avgCompletionDays: 55,
    winRate: 55,
    revisionRate: 16,
    satisfaction: 4.7,
    revenueSeries: build(months, 46000, 7400, 6),
    completionSeries: months.map((period, i) => ({ period, completed: [1, 2, 1, 2, 1, 2][i], avgDays: 64 - i * 2 })),
    winRateSeries: months.map((period, i) => ({ period, won: [6, 8, 7, 9, 10, 11][i], lost: [7, 6, 7, 6, 7, 8][i] })),
    satisfactionSeries: months.map((period, i) => ({ period, score: [4.4, 4.5, 4.6, 4.6, 4.7, 4.8][i], revisions: [8, 7, 8, 6, 5, 5][i] })),
  },
};
