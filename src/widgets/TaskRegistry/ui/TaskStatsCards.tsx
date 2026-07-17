import { motion } from "framer-motion";
import { cn } from "@shared/lib";
import type { TaskStatsFull } from "../model/types";
import { STAT_CARDS } from "../model/constants";

interface TaskStatsCardsProps {
  stats: TaskStatsFull | null;
}

export const TaskStatsCards = ({ stats }: TaskStatsCardsProps) => {
  const values: Record<string, number> = {
    total: stats?.total ?? 0,
    inProgress: stats?.active ?? 0,
    completed: stats?.completed ?? 0,
    overdue: stats?.overdue ?? 0,
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {STAT_CARDS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-3xl shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                stat.bg,
                stat.color,
              )}
            >
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
          </motion.div>
        );
      })}
    </section>
  );
};
