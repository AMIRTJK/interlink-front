/*
 * Типы и мапперы вкладки «Аналитика» личного кабинета.
 * Источник данных — GET /api/v1/personal-analytics: только личные задачи
 * (personal-tasks) и встречи текущего авторизованного пользователя.
 */

export type PersonalTaskStatus =
  | "new"
  | "in_progress"
  | "review"
  | "completed"
  | "overdue";

export type PersonalTaskPriority = "low" | "medium" | "high" | "critical";

/* ===================== Ответ API ===================== */
export interface IPersonalAnalyticsSummary {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
  completion_pct: number;
  avg_progress: number;
}

export interface IStatusBreakdownItem {
  status: PersonalTaskStatus;
  count: number;
}

export interface IPriorityBreakdownItem {
  priority: PersonalTaskPriority;
  count: number;
}

export interface IProgressItem {
  id: number;
  title: string;
  short_title: string;
  progress: number;
  status: PersonalTaskStatus;
  priority: PersonalTaskPriority;
  due_date: string;
}

export interface IEventsByMonthItem {
  month: number; // 1-12
  count: number;
}

export interface IPersonalAnalyticsData {
  year: number;
  summary: IPersonalAnalyticsSummary;
  tasks: {
    status_breakdown: IStatusBreakdownItem[];
    priority_breakdown: IPriorityBreakdownItem[];
    progress_items: IProgressItem[];
  };
  calendar: {
    events_by_month: IEventsByMonthItem[];
  };
}

export interface IPersonalAnalyticsResponse {
  success: boolean;
  message: string;
  data: IPersonalAnalyticsData;
}

/* ===================== View-model для графиков ===================== */
// type-алиасы (не interface): у них есть неявная индексная сигнатура, поэтому
// они присваиваются к типу data recharts (ChartDataInput).
export type ICategoricalDatum = {
  name: string;
  value: number;
  fill: string;
};

export type IProgressDatum = {
  name: string;
  progress: number;
  fullTitle: string;
};

export type IMonthlyDatum = {
  month: string;
  count: number;
};

/* ===================== Справочники (порядок / подписи / цвета) ===================== */
// Короткие названия месяцев для оси событий календаря (index = month - 1).
export const MONTH_LABELS_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
] as const;

// Порядок, подписи и цвета зафиксированы на фронте, чтобы дизайн графиков
// не зависел от порядка элементов в ответе API.
const STATUS_META: { key: PersonalTaskStatus; name: string; fill: string }[] = [
  { key: "new", name: "Новая", fill: "#94a3b8" },
  { key: "in_progress", name: "В работе", fill: "#3b82f6" },
  { key: "review", name: "На ревью", fill: "#8b5cf6" },
  { key: "completed", name: "Завершена", fill: "#10b981" },
  { key: "overdue", name: "Просрочена", fill: "#ef4444" },
];

const PRIORITY_META: { key: PersonalTaskPriority; name: string; fill: string }[] = [
  { key: "low", name: "Низкий", fill: "#94a3b8" },
  { key: "medium", name: "Средний", fill: "#3b82f6" },
  { key: "high", name: "Высокий", fill: "#f97316" },
  { key: "critical", name: "Критичный", fill: "#ef4444" },
];

/* ===================== Мапперы: API → данные графиков ===================== */
export const mapStatusBreakdown = (
  items: IStatusBreakdownItem[] = [],
): ICategoricalDatum[] => {
  const counts = new Map(items.map((i) => [i.status, i.count]));
  return STATUS_META.map((m) => ({
    name: m.name,
    value: counts.get(m.key) ?? 0,
    fill: m.fill,
  }));
};

export const mapPriorityBreakdown = (
  items: IPriorityBreakdownItem[] = [],
): ICategoricalDatum[] => {
  const counts = new Map(items.map((i) => [i.priority, i.count]));
  return PRIORITY_META.map((m) => ({
    name: m.name,
    value: counts.get(m.key) ?? 0,
    fill: m.fill,
  }));
};

export const mapProgressItems = (
  items: IProgressItem[] = [],
): IProgressDatum[] =>
  items.map((t) => ({
    name: t.short_title || t.title.slice(0, 14),
    progress: t.progress,
    fullTitle: t.title,
  }));

export const mapEventsByMonth = (
  items: IEventsByMonthItem[] = [],
): IMonthlyDatum[] =>
  items.map((e) => ({
    month: MONTH_LABELS_SHORT[e.month - 1] ?? String(e.month),
    count: e.count,
  }));
