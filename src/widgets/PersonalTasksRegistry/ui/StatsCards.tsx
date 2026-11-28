import { memo } from "react";
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

export const StatsCards = memo(({ stats }: IProps) => {
  const cards = [
    {
      key: "total",
      label: "Всего задач",
      value: stats.total,
      icon: FolderOpen,
      color: "text-zinc-500! dark:text-zinc-400! bg-zinc-100! dark:bg-th-raised!",
      textColor: "text-zinc-700! dark:text-zinc-200!",
    },
    {
      key: "inProgress",
      label: "В работе",
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-600! dark:text-blue-400! bg-blue-100! dark:bg-blue-900/35!",
      textColor: "text-blue-700! dark:text-blue-300!",
    },
    {
      key: "completed",
      label: "Завершено",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600! dark:text-emerald-400! bg-emerald-100! dark:bg-emerald-900/35!",
      textColor: "text-emerald-700! dark:text-emerald-300!",
    },
    {
      key: "overdue",
      label: "Просрочено",
      value: stats.overdue,
      icon: X,
      color: "text-red-600! dark:text-red-400! bg-red-100! dark:bg-red-900/35!",
      textColor: "text-red-700! dark:text-red-300!",
    },
  ];

  return (
    <div className="grid! grid-cols-4! gap-3!">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-2xl! p-3.5! bg-white/40! dark:bg-th-raised/90! backdrop-blur-xl! ui-glass ui-glass--forced border! border-zinc-200! dark:border-th-high/50! shadow-none! flex! items-center! gap-3!"
          >
            <div className={`p-2.5! rounded-xl! ${card.color}`}>
              <Icon size={18} />
            </div>
            <div className="flex! flex-col!">
              <span className="text-[11px]! font-medium! text-zinc-400! dark:text-zinc-500! leading-tight!">
                {card.label}
              </span>
              <span className={`text-lg! font-bold! leading-tight! ${card.textColor}`}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
