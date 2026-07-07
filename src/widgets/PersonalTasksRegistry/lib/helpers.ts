import type { TPriority, TTaskStatus } from "../model/types";

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Низкий", color: "bg-slate-400", textColor: "text-slate-600", rank: 1 },
  { value: "medium", label: "Средний", color: "bg-blue-400", textColor: "text-blue-600", rank: 2 },
  { value: "high", label: "Высокий", color: "bg-orange-400", textColor: "text-orange-600", rank: 3 },
  { value: "critical", label: "Критический", color: "bg-red-500", textColor: "text-red-600", rank: 4 },
] as const;

export const STATUS_OPTIONS = [
  { value: "new", label: "Новая", color: "bg-sky-400", rank: 1 },
  { value: "in_progress", label: "В работе", color: "bg-blue-500", rank: 2 },
  { value: "review", label: "Ревью", color: "bg-purple-400", rank: 3 },
  { value: "completed", label: "Завершена", color: "bg-emerald-500", rank: 4 },
  { value: "overdue", label: "Просрочена", color: "bg-red-500", rank: 0 },
] as const;

export const formatDueDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getPriorityMeta = (p: TPriority) => {
  return PRIORITY_OPTIONS.find((o) => o.value === p) || PRIORITY_OPTIONS[1];
};

export const getStatusMeta = (s: TTaskStatus) => {
  return STATUS_OPTIONS.find((o) => o.value === s) || STATUS_OPTIONS[0];
};

export const getCountdown = (dueDate?: string) => {
  if (!dueDate) return { text: "", type: "future" as const };
  const now = new Date().getTime();
  const target = new Date(dueDate).getTime();
  const diff = target - now;
  if (diff <= 0) return { text: "Просрочено", type: "overdue" as const };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return { text: `${days}д ${hours}ч`, type: "future" as const };
  return { text: `${hours}ч ${minutes}м`, type: "urgent" as const };
};
