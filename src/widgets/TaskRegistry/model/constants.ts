import { FolderOpen, Clock, CheckCircle2, X } from "lucide-react";
import type { FilterTabId, StatKey } from "./types";

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Низкий", color: "bg-slate-400", textColor: "text-slate-600 dark:text-slate-300", dotBg: "bg-slate-400", rank: 1 },
  { value: "medium", label: "Средний", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", dotBg: "bg-blue-500", rank: 2 },
  { value: "high", label: "Высокий", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", dotBg: "bg-amber-500", rank: 3 },
  { value: "critical", label: "Критический", color: "bg-rose-500", textColor: "text-rose-600 dark:text-rose-400", dotBg: "bg-rose-500", rank: 4 },
] as const;

export const STATUS_OPTIONS = [
  { value: "new", label: "Новая", color: "bg-sky-400", dotBg: "bg-sky-400", rank: 1 },
  { value: "in_progress", label: "В работе", color: "bg-blue-500", dotBg: "bg-blue-500", rank: 2 },
  { value: "review", label: "На проверке", color: "bg-purple-400", dotBg: "bg-purple-400", rank: 3 },
  { value: "completed", label: "Завершена", color: "bg-emerald-500", dotBg: "bg-emerald-500", rank: 4 },
  { value: "overdue", label: "Просрочена", color: "bg-red-500", dotBg: "bg-red-500", rank: 0 },
] as const;

/** Статусы для выбора в формах и карточках (без автоматического 'Просрочена') */
export const FORM_STATUS_OPTIONS = [
  { value: "new", label: "Новая", dotBg: "bg-sky-500", color: "bg-sky-500", textColor: "text-sky-600 dark:text-sky-400" },
  { value: "in_progress", label: "В работе", dotBg: "bg-indigo-500", color: "bg-indigo-500", textColor: "text-indigo-600 dark:text-indigo-400" },
  { value: "review", label: "На проверке", dotBg: "bg-purple-500", color: "bg-purple-500", textColor: "text-purple-600 dark:text-purple-400" },
  { value: "completed", label: "Завершена", dotBg: "bg-emerald-500", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
] as const;

export const STAT_CARDS = [
  {
    key: "total",
    label: "Всего задач",
    icon: FolderOpen,
    color: "text-zinc-500",
    bg: "bg-zinc-50 dark:bg-zinc-800/40",
  },
  {
    key: "inProgress",
    label: "В работе",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    key: "completed",
    label: "Завершено",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    key: "overdue",
    label: "Просрочено",
    icon: X,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/30",
  },
] as const satisfies ReadonlyArray<{
  key: StatKey;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}>;

export const FILTER_TABS = [
  { id: "all", label: "Все", statKey: "total" },
  { id: "active", label: "Активные", statKey: "inProgress" },
  { id: "completed", label: "Завершённые", statKey: "completed" },
  { id: "overdue", label: "Просроченные", statKey: "overdue" },
] as const satisfies ReadonlyArray<{
  id: FilterTabId;
  label: string;
  statKey: StatKey;
}>;

export const SORT_OPTIONS = [
  { id: "dueDate", label: "По сроку" },
  { id: "priority", label: "По приоритету" },
  { id: "status", label: "По статусу" },
] as const;
