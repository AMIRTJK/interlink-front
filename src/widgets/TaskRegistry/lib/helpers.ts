import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../model/constants";
import type { Priority, TaskStatus } from "../model/types";

export const formatDueDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getPriorityMeta = (p: Priority) =>
  PRIORITY_OPTIONS.find((o) => o.value === p)!;

export const getStatusMeta = (s: TaskStatus) =>
  STATUS_OPTIONS.find((o) => o.value === s)!;

/** Короткий обратный отсчёт для строки таблицы/детали. */
export const getCountdown = (dueDate: string) => {
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

/** Живой обратный отсчёт до конца срока (с секундами). */
export const getFullCountdown = (dueDate: string) => {
  const target = new Date(dueDate);
  target.setHours(23, 59, 59, 999);
  const diff = target.getTime() - new Date().getTime();
  if (diff <= 0) {
    return { type: "overdue" as const, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const type = diff < 1000 * 60 * 60 * 24 ? ("urgent" as const) : ("future" as const);
  return { type, days, hours, minutes, seconds };
};

export const signTimestamp = () =>
  new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
