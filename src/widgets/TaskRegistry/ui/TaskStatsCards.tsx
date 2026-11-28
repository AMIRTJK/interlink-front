import { Layers, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@shared/lib";
import type { TaskStatsFull } from "../model/types";
import { PriorityBreakdownBar } from "./PriorityBreakdownBar";

interface TaskStatsCardsProps {
  stats: TaskStatsFull | null;
}

// Карточка — как в профиле: поверхность темы и стекло; цвет показателя несут
// подпись, число и значок, а не фон.
const CARD =
  "ui-glass flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-th-high/50 bg-white/70 dark:bg-th-raised/90 px-5 py-4";

const STAT_ITEMS = [
  {
    key: "total",
    label: "Всего задач",
    icon: Layers,
    labelClass: "text-th-accent-500 dark:text-th-accent-300",
    iconBgClass: "bg-th-accent-100 text-th-accent-600 dark:bg-th-accent-900/40 dark:text-th-accent-300",
    valClass: "text-slate-900 dark:text-white",
  },
  {
    key: "inProgress",
    label: "В работе",
    icon: Clock,
    labelClass: "text-amber-600 dark:text-amber-400",
    iconBgClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    valClass: "text-amber-600 dark:text-amber-300",
  },
  {
    key: "completed",
    label: "Завершено",
    icon: CheckCircle2,
    labelClass: "text-emerald-600 dark:text-emerald-400",
    iconBgClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    valClass: "text-emerald-600 dark:text-emerald-300",
  },
  {
    key: "overdue",
    label: "Просрочено",
    icon: AlertTriangle,
    labelClass: "text-rose-600 dark:text-rose-400",
    iconBgClass: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    valClass: "text-rose-600 dark:text-rose-300",
  },
] as const;

export const TaskStatsCards = ({ stats }: TaskStatsCardsProps) => {
  const values: Record<string, number> = {
    total: stats?.total ?? 0,
    inProgress: stats?.active ?? 0,
    completed: stats?.completed ?? 0,
    overdue: stats?.overdue ?? 0,
  };

  return (
    <div className="flex flex-col gap-3">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_ITEMS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className={CARD}>
              <div className="min-w-0">
                <p className={cn("text-[11px] font-bold uppercase tracking-wider", stat.labelClass)}>
                  {stat.label}
                </p>
                <p className={cn("mt-1 text-3xl font-black leading-none tabular-nums", stat.valClass)}>
                  {values[stat.key]}
                </p>
              </div>
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", stat.iconBgClass)}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </section>

      <PriorityBreakdownBar breakdown={stats?.priority_breakdown || {}} />
    </div>
  );
};
