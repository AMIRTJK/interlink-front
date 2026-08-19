import { Layers, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@shared/lib";
import type { Priority, TaskStatsFull } from "../model/types";

interface TaskStatsCardsProps {
  stats: TaskStatsFull | null;
}

const STAT_ITEMS = [
  {
    key: "total",
    label: "ВСЕГО ЗАДАЧ",
    icon: Layers,
    bgClass: "bg-gradient-to-br from-indigo-50/90 via-slate-50 to-blue-50/60 border-indigo-100/80 dark:from-indigo-950/30 dark:to-slate-900/40 dark:border-indigo-900/40",
    labelClass: "text-indigo-400 dark:text-indigo-300",
    iconBgClass: "bg-indigo-100/90 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300",
    valClass: "text-indigo-900 dark:text-indigo-100",
  },
  {
    key: "inProgress",
    label: "В РАБОТЕ",
    icon: Clock,
    bgClass: "bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-50/40 border-amber-100/80 dark:from-amber-950/30 dark:to-slate-900/40 dark:border-amber-900/40",
    labelClass: "text-amber-500 dark:text-amber-400",
    iconBgClass: "bg-amber-100/90 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300",
    valClass: "text-amber-600 dark:text-amber-200",
  },
  {
    key: "completed",
    label: "ЗАВЕРШЕНО",
    icon: CheckCircle2,
    bgClass: "bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-green-50/40 border-emerald-100/80 dark:from-emerald-950/30 dark:to-slate-900/40 dark:border-emerald-900/40",
    labelClass: "text-emerald-500 dark:text-emerald-400",
    iconBgClass: "bg-emerald-100/90 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300",
    valClass: "text-emerald-600 dark:text-emerald-200",
  },
  {
    key: "overdue",
    label: "ПРОСРОЧЕНО",
    icon: AlertTriangle,
    bgClass: "bg-gradient-to-br from-rose-50/90 via-pink-50/30 to-rose-50/40 border-rose-100/80 dark:from-rose-950/30 dark:to-slate-900/40 dark:border-rose-900/40",
    labelClass: "text-rose-400 dark:text-rose-300",
    iconBgClass: "bg-rose-100/90 text-rose-500 dark:bg-rose-900/60 dark:text-rose-300",
    valClass: "text-rose-600 dark:text-rose-200",
  },
] as const;

const PriorityBreakdownPills = ({ breakdown }: { breakdown: Record<string, number> }) => {
  const low = breakdown["low"] || 0;
  const medium = breakdown["medium"] || 0;
  const high = breakdown["high"] || 0;
  const critical = breakdown["critical"] || 0;
  const total = low + medium + high + critical;

  const getPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

  const lowPct = total > 0 ? getPct(low) : 18;
  const medPct = total > 0 ? getPct(medium) : 55;
  const highPct = total > 0 ? getPct(high) : 18;
  const critPct = total > 0 ? getPct(critical) : 9;

  return (
    <div className="w-full flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[120px] bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/10 rounded-2xl py-2.5 px-4 text-center shadow-xs">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          Низкий {lowPct}%
        </span>
      </div>

      <div className="flex-[2] min-w-[200px] bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 rounded-2xl py-2.5 px-6 text-center shadow-sm shadow-indigo-100/50 dark:shadow-none">
        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
          Средний {medPct}%
        </span>
      </div>

      <div className="flex-1 min-w-[120px] bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl py-2.5 px-4 text-center shadow-xs">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
          Высокий {highPct}%
        </span>
      </div>

      <div className="flex-1 min-w-[120px] bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl py-2.5 px-4 text-center shadow-xs">
        <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
          Критический {critPct}%
        </span>
      </div>
    </div>
  );
};

export const TaskStatsCards = ({ stats }: TaskStatsCardsProps) => {
  const values: Record<string, number> = {
    total: stats?.total ?? 11,
    inProgress: stats?.active ?? 2,
    completed: stats?.completed ?? 1,
    overdue: stats?.overdue ?? 8,
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_ITEMS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className={cn(
                "p-5 rounded-3xl border backdrop-blur-md shadow-xs flex flex-col justify-between h-28 transition-all hover:shadow-md",
                stat.bgClass,
              )}
            >
              <p className={cn("text-[10px] font-extrabold tracking-wider uppercase", stat.labelClass)}>
                {stat.label}
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", stat.iconBgClass)}>
                  <Icon size={18} />
                </div>
                <span className={cn("text-3xl font-black leading-none", stat.valClass)}>
                  {values[stat.key]}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <PriorityBreakdownPills breakdown={stats?.priority_breakdown || {}} />
    </div>
  );
};
