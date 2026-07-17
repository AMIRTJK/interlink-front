// Состояние серверной фильтрации/сортировки модуля «Задачи» и сборка query-параметров
// для GET /api/v1/tasks и GET /api/v1/tasks/board.

import type { Priority, TaskStatus } from "./types";

export type TaskSortField =
  | "manual"
  | "due_date"
  | "priority"
  | "status"
  | "created_at";
export type SortDir = "asc" | "desc";
export type TaskDateType = "created" | "planned" | "started" | "completed";
/** Режим отображения реестра: таблица или канбан-доска. */
export type TaskDisplayMode = "table" | "board";

export interface TaskFilters {
  search: string;
  status: TaskStatus | "";
  priority: Priority | "";
  assigneeId: string; // "" = все
  mine: boolean;
  sort: TaskSortField;
  dir: SortDir;
  date: string; // YYYY-MM-DD или ""
  dateType: TaskDateType;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  status: "",
  priority: "",
  assigneeId: "",
  mine: false,
  sort: "due_date",
  dir: "asc",
  date: "",
  dateType: "planned",
};

/** Размер страницы серверной пагинации списка. */
export const LIST_PAGE_SIZE = 10;

/** Собирает query-параметры фильтрации/сортировки (без пагинации; пустые значения опускаются). */
export const buildTaskParams = (
  f: TaskFilters,
): Record<string, string | number> => {
  const p: Record<string, string | number> = {};
  if (f.search.trim()) p.search = f.search.trim();
  if (f.status) p.status = f.status;
  if (f.priority) p.priority = f.priority;
  if (f.assigneeId) p.assignee_id = f.assigneeId;
  if (f.mine) p.mine = 1;
  if (f.sort) p.sort = f.sort;
  if (f.dir) p.dir = f.dir;
  if (f.date) {
    p.date = f.date;
    p.date_type = f.dateType;
  }
  return p;
};

export const SORT_FIELD_OPTIONS: { id: TaskSortField; label: string }[] = [
  { id: "due_date", label: "По сроку" },
  { id: "priority", label: "По приоритету" },
  { id: "status", label: "По статусу" },
  { id: "created_at", label: "По дате создания" },
  { id: "manual", label: "Вручную" },
];

export const DATE_TYPE_OPTIONS: { id: TaskDateType; label: string }[] = [
  { id: "planned", label: "По сроку" },
  { id: "created", label: "По созданию" },
  { id: "started", label: "По началу" },
  { id: "completed", label: "По завершению" },
];
