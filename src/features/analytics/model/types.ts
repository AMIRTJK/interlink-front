export interface IAnalyticsHero {
  totalTasks: number;
  completionRate: number; 
  overdueCount: number;
  averageTime: string; 
}

export interface IAnalyticsActivity {
  date: string; 
  count: number;
}

export interface IAnalyticsData {
  hero: IAnalyticsHero;
  activity: IAnalyticsActivity[];
}

export interface IAnalyticsRequest {
  userId: string;
  date: string; 
}
