// Модель данных модуля «Задачи». Соответствует дизайн-коду; когда появится
// реальное API, эти типы станут целевой формой маппинга (см. useTasks.ts).

export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus =
  | "new"
  | "in_progress"
  | "review"
  | "completed"
  | "overdue";
export type ViewState = "list" | "create";
export type TaskType = "personal" | "protocol";

export interface Colleague {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Tailwind-класс фона аватара, напр. "bg-blue-500". */
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: Colleague;
  dueDate: string; // ISO
  createdAt: string; // ISO
  tags: string[];
  progress: number;
  attachments: Attachment[];
}

export interface SortConfig {
  key: "dueDate" | "priority" | "status";
  direction: "asc" | "desc";
}

/** Строка протокольного (пакетного) создания задач. */
export interface BatchRow {
  id: number;
  title: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string;
}

/** Подпункт строки протокола. */
export interface SubRow {
  id: number;
  title: string;
}

export type FilterTabId = "all" | "active" | "completed" | "overdue";
export type StatKey = "total" | "inProgress" | "completed" | "overdue";

export interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
