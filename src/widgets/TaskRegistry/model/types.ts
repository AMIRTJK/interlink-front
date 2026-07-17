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
  /** Числовой ID вложения на бэкенде — для скачивания/удаления. */
  rawId?: number;
  name: string;
  type: string;
  size: string;
}

export interface Task {
  /** Человекочитаемый ID для отображения/поиска, напр. "TSK-1024". */
  id: string;
  /** Числовой ID задачи с бэкенда — для запросов к API. */
  rawId?: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  /** Основной исполнитель (первый из assignees) — для карточки/строки. */
  assignee: Colleague;
  /** Полный список исполнителей задачи. */
  assignees: Colleague[];
  dueDate: string; // ISO
  createdAt: string; // ISO
  tags: string[];
  progress: number;
  attachments: Attachment[];
}

/** Тело запроса на создание/обновление задачи (POST/PUT /api/v1/tasks). */
export interface TaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  progress?: number;
  /** Срок в формате YYYY-MM-DD. */
  due_date: string | null;
  /** ID исполнителей. */
  assignees: number[];
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

/** Полная статистика с /api/v1/tasks/stats (по каждому статусу). */
export interface TaskStatsFull {
  total: number;
  new: number;
  in_progress: number;
  review: number;
  completed: number;
  overdue: number;
  active: number;
  priority_breakdown?: Record<string, number>;
}
