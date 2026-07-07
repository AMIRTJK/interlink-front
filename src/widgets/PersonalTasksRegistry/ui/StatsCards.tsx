import { motion } from "framer-motion";
import { FolderOpen, Clock, CheckCircle2, X } from "lucide-react";

interface IStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface IProps {
  stats: IStats;
}

export const StatsCards = ({ stats }: IProps) => {
  const cards = [
    {
      key: "total",
      label: "Всего задач",
      value: stats.total,
      icon: FolderOpen,
      color: "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800",
      textColor: "text-zinc-700 dark:text-zinc-200",
    },
    {
      key: "inProgress",
      label: "В работе",
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/35",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      key: "completed",
      label: "Завершено",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/35",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "overdue",
      label: "Просрочено",
      value: stats.overdue,
      icon: X,
      color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/35",
      textColor: "text-red-700 dark:text-red-300",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl p-4 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3"
          >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <div className={`text-2xl font-black leading-none ${card.textColor}`}>
                {card.value}
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {card.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
