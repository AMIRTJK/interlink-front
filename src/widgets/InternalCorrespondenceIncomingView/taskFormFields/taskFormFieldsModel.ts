export type PriorityLevel = "low" | "medium" | "high";

export interface ExecutorUser {
  id: number;
  full_name: string;
  phone: string;
}

export const AVATAR_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-rose-50 text-rose-600 border-rose-100",
  "bg-indigo-50 text-indigo-600 border-indigo-100",
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
