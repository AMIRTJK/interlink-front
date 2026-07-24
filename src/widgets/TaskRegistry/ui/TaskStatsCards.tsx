import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Priority, TaskStatsFull } from "../model/types";
import { STAT_CARDS, PRIORITY_OPTIONS } from "../model/constants";

interface TaskStatsCardsProps {
  stats: TaskStatsFull | null;
}

const PriorityBreakdown = ({ breakdown }: { breakdown: Record<string, number> }) => {
  const total = PRIORITY_OPTIONS.reduce((sum, o) => sum + (breakdown[o.value] || 0), 0);

  return (
    <div className="p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-3xl shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Распределение по приоритету
        </p>
        <span className="text-[10px] font-bold text-slate-400">
          Всего: {total}
        </span>
      </div>

      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <If is={total > 0}>
          {PRIORITY_OPTIONS.map((o) => {
            const value = breakdown[o.value as Priority] || 0;
            if (value === 0) return null;
            return (
              <div
                key={o.value}
                className={cn("h-full", o.color)}
                style={{ width: `${(value / total) * 100}%` }}
                title={`${o.label}: ${value}`}
              />
            );
          })}
        </If>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {PRIORITY_OPTIONS.map((o) => (
          <div key={o.value} className="flex items-center gap-2">
            <span className={cn("w-2.5 h-2.5 rounded-full", o.color)} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {o.label}
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
              {breakdown[o.value as Priority] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TaskStatsCards = ({ stats }: TaskStatsCardsProps) => {
  const values: Record<string, number> = {
    total: stats?.total ?? 0,
    inProgress: stats?.active ?? 0,
    completed: stats?.completed ?? 0,
    overdue: stats?.overdue ?? 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-3xl shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-all duration-300"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                <Icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
                  {values[stat.key]}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <PriorityBreakdown breakdown={stats?.priority_breakdown || {}} />
    </div>
  );
};
