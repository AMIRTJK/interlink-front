

import type { Priority, TaskStatus } from "./types";

export type TaskSortField =
  | "manual"
  | "due_date"
  | "priority"
  | "status"
  | "created_at";
export type SortDir = "asc" | "desc";
export type TaskDateType = "created" | "planned" | "started" | "completed";
export type TaskDisplayMode = "table" | "board";

export const TASKS_DISPLAY_MODE_STORAGE_KEY = "tasks_display_mode";

export type TaskProgressFilter =
  | ""
  | "all"
  | "0"
  | "25"
  | "50"
  | "75"
  | "100"
  | "in_progress"
  | "done"
  | "not_started";

export interface TaskFilters {
  search: string;
  status: TaskStatus | "";
  priority: Priority | "";
  assigneeId: string; // "" = все
  progress: TaskProgressFilter;
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
  progress: "",
  mine: false,
  sort: "due_date",
  dir: "desc",
  date: "",
  dateType: "planned",
};

export const LIST_PAGE_SIZE = 7;

export const buildTaskParams = (
  f: TaskFilters,
): Record<string, string | number> => {
  const p: Record<string, string | number> = {};
  if (f.search.trim()) p.search = f.search.trim();
  if (f.status === "overdue") {
    p.status = "overdue";
    p.is_overdue = 1;
  } else if (f.status) {
    p.status = f.status;
  }
  if (f.priority) p.priority = f.priority;
  if (f.assigneeId) p.assignee_id = f.assigneeId;
  if (f.progress && f.progress !== "all") {
    if (f.progress === "done" || f.progress === "100") {
      p.progress = 100;
    } else if (f.progress === "not_started" || f.progress === "0") {
      p.progress = 0;
    } else if (!Number.isNaN(Number(f.progress))) {
      p.progress = Number(f.progress);
    } else {
      p.progress = f.progress;
    }
  }
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
