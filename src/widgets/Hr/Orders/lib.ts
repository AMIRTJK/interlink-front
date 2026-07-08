import { TOrderStatus } from "./model";

export const ORDER_STATUS_CONFIG: Record<
  TOrderStatus,
  { bg: string; text: string; dot: string }
> = {
  draft: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  signed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  approved: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

export const ORDER_STATUS_FALLBACK = {
  bg: "bg-slate-100",
  text: "text-slate-500",
  dot: "bg-slate-400",
};

export const getStatusConfig = (status: string) =>
  ORDER_STATUS_CONFIG[status as TOrderStatus] || ORDER_STATUS_FALLBACK;

const RU_MONTHS_GEN = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export const parseDate = (dateStr: string) => {
  const dotParts = dateStr.split(".");
  if (dotParts.length === 3) {
    const day = dotParts[0];
    const monthIdx = parseInt(dotParts[1], 10) - 1;
    const year = dotParts[2];
    return { day, month: RU_MONTHS_GEN[monthIdx] ?? dotParts[1], year };
  }

  const isoParts = dateStr.split("-");
  if (isoParts.length === 3) {
    const year = isoParts[0];
    const monthIdx = parseInt(isoParts[1], 10) - 1;
    const day = isoParts[2];
    return { day, month: RU_MONTHS_GEN[monthIdx] ?? isoParts[1], year };
  }

  return { day: "___", month: "______", year: "____" };
};

export const getExecutorInitials = (executorName: string) => {
  if (!executorName) return "";
  return executorName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
