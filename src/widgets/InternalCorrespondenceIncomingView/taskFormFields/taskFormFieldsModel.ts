export type PriorityLevel = "low" | "medium" | "high";

export interface ExecutorUser {
  id: number;
  full_name: string;
  phone: string;
}

export const AVATAR_COLORS = [
  "bg-th-accent-50 text-th-accent-600 border-th-accent-100 dark:bg-th-accent-900/35 dark:text-th-accent-400 dark:border-th-accent-800/50",
  "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/35 dark:text-emerald-400 dark:border-emerald-800/50",
  "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/35 dark:text-purple-400 dark:border-purple-800/50",
  "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/35 dark:text-amber-400 dark:border-amber-800/50",
  "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/35 dark:text-rose-400 dark:border-rose-800/50",
  "bg-th-accent-50 text-th-accent-600 border-th-accent-100 dark:bg-th-accent-900/35 dark:text-th-accent-400 dark:border-th-accent-800/50",
];

export const getInitials = (fullName: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const priorityConfig: Record<
  PriorityLevel,
  { label: string; activeClass: string; inactiveClass: string }
> = {
  low: {
    label: "Низкий",
    activeClass: "bg-emerald-500 text-white border-emerald-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-emerald-300",
  },
  medium: {
    label: "Средний",
    activeClass: "bg-amber-500 text-white border-amber-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-amber-300",
  },
  high: {
    label: "Высокий",
    activeClass: "bg-rose-500 text-white border-rose-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-rose-300",
  },
};

export const priorityKeys: PriorityLevel[] = ["low", "medium", "high"];
