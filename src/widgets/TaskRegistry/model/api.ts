// Слой интеграции модуля «Задачи» с backend /api/v1/tasks.
// Здесь описаны сырые типы ответов API и функции маппинга в доменную модель
// (Task / Colleague), которую используют UI-компоненты.

import type {
  Attachment,
  Colleague,
  Priority,
  Task,
  TaskStatus,
} from "./types";

/* ===================== RAW API TYPES ===================== */

export interface IApiAssignee {
  id: number;
  full_name?: string;
  name?: string;
  position?: string;
  role?: string;
  photo_path?: string | null;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface IApiAttachment {
  id: number;
  name?: string;
  file_name?: string;
  original_name?: string;
  mime_type?: string | null;
  type?: string | null;
  size?: number | string | null;
  [key: string]: unknown;
}

export interface IApiTask {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  progress?: number | null;
  tags?: string[] | null;
  due_date?: string | null;
  planned_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  sort_order?: number | null;
  is_overdue?: boolean;
  assignees?: IApiAssignee[] | null;
  attachments?: IApiAttachment[] | null;
  attachments_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IApiStats {
  total: number;
  new: number;
  in_progress: number;
  review: number;
  completed: number;
  overdue: number;
  active: number;
  priority_breakdown?: Record<string, number>;
}

/* ===================== HELPERS ===================== */

const VALID_STATUSES: TaskStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "overdue",
];
const VALID_PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-pink-500",
];

/** Детерминированный цвет аватара по id — чтобы не «прыгал» между рендерами. */
export const colorFromId = (id: string | number): string => {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/** Инициалы из ФИО (максимум 2 буквы). */
export const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** Форматирование размера файла: принимает байты (number) или готовую строку. */
export const formatFileSize = (size?: number | string | null): string => {
  if (size == null) return "";
  if (typeof size === "string") return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeStatus = (status?: string | null): TaskStatus =>
  VALID_STATUSES.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : "new";

const normalizePriority = (priority?: string | null): Priority =>
  VALID_PRIORITIES.includes(priority as Priority)
    ? (priority as Priority)
    : "medium";

/* ===================== MAPPERS ===================== */

export const mapAssigneeToColleague = (a: IApiAssignee): Colleague => {
  const name = String(a.full_name || a.name || "Без имени");
  return {
    id: String(a.id),
    name,
    role: String(a.position || a.role || ""),
    initials: initialsFromName(name),
    color: colorFromId(a.id),
  };
};

const EMPTY_ASSIGNEE: Colleague = {
  id: "",
  name: "Не назначен",
  role: "",
  initials: "—",
  color: "bg-slate-400",
};

const mapAttachment = (att: IApiAttachment): Attachment => {
  const name = String(att.name || att.file_name || att.original_name || "Файл");
  const ext = name.includes(".") ? name.split(".").pop()!.toUpperCase() : "";
  return {
    id: String(att.id),
    rawId: att.id,
    name,
    type: String(att.type || att.mime_type || ext || "FILE"),
    size: formatFileSize(att.size),
  };
};

export const mapApiTaskToTask = (item: IApiTask): Task => {
  const assignees = (item.assignees || []).map(mapAssigneeToColleague);
  const dueSource = item.due_date || item.planned_at || item.created_at || "";
  return {
    id: `TSK-${item.id}`,
    rawId: item.id,
    title: item.title || "",
    description: item.description || "",
    status: normalizeStatus(item.status),
    priority: normalizePriority(item.priority),
    assignee: assignees[0] || EMPTY_ASSIGNEE,
    assignees,
    dueDate: dueSource ? new Date(dueSource).toISOString() : "",
    createdAt: item.created_at
      ? new Date(item.created_at).toISOString()
      : new Date().toISOString(),
    tags: Array.isArray(item.tags) ? item.tags : [],
    progress: typeof item.progress === "number" ? item.progress : 0,
    attachments: (item.attachments || []).map(mapAttachment),
  };
};

const BOARD_COLUMNS: TaskStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "overdue",
];

/** Маппит ответ /api/v1/tasks/board в колонки доменных задач. */
export const mapBoard = (res: unknown): Record<TaskStatus, Task[]> => {
  const r = res as { data?: unknown } | undefined;
  const cols = (r?.data ?? r) as Record<string, IApiTask[]> | undefined;
  const result = {
    new: [],
    in_progress: [],
    review: [],
    completed: [],
    overdue: [],
  } as Record<TaskStatus, Task[]>;
  if (cols) {
    BOARD_COLUMNS.forEach((key) => {
      const arr = cols[key];
      result[key] = Array.isArray(arr) ? arr.map(mapApiTaskToTask) : [];
    });
  }
  return result;
};

/**
 * Достаёт массив сущностей из ответа API, устойчиво к разным обёрткам:
 * `{ data: [...] }`, `{ data: { data: [...] } }`, либо сам массив.
 */
export const extractList = <T = unknown>(res: unknown): T[] => {
  const r = res as { data?: unknown } | undefined;
  if (Array.isArray(r)) return r as T[];
  if (Array.isArray(r?.data)) return r!.data as T[];
  const nested = (r?.data as { data?: unknown } | undefined)?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
};

export interface Pagination {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

/**
 * Извлекает метаданные серверной пагинации, устойчиво к разным форматам:
 * `res.meta`, `res.data.meta` или пагинатор Laravel в `res.data`
 * (`current_page/last_page/total/per_page`).
 */
export const extractPagination = (
  res: unknown,
  fallbackCount: number,
  defaultPerPage: number,
): Pagination => {
  const r = (res ?? {}) as Record<string, unknown>;
  const dataField = r.data as Record<string, unknown> | unknown[] | undefined;
  const metaCandidate =
    (r.meta as Record<string, unknown> | undefined) ??
    (dataField && !Array.isArray(dataField)
      ? ((dataField.meta as Record<string, unknown> | undefined) ?? dataField)
      : undefined);
  const meta = (metaCandidate ?? {}) as Record<string, unknown>;
  const num = (v: unknown, d: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : d;
  };
  const perPage = num(meta.per_page, defaultPerPage);
  const total = num(meta.total, fallbackCount);
  const currentPage = num(meta.current_page, 1);
  const lastPage = num(meta.last_page, Math.max(1, Math.ceil(total / perPage)));
  return { total, lastPage, currentPage, perPage };
};
