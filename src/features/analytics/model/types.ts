export interface IAnalyticsHero {
  totalTasks: number;
  completionRate: number; // 0-100
  overdueCount: number;
  averageTime: string; // e.g. "2ч 30м"
}

export interface IAnalyticsActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface IAnalyticsData {
  hero: IAnalyticsHero;
  activity: IAnalyticsActivity[];
}

export interface IAnalyticsRequest {
  userId: string;
  date: string; // ISO string or YYYY-MM-DD
}
