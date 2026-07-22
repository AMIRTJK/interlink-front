import { memo } from "react";
import type { TFilterTab } from "../model/types";

interface IStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface IProps {
  activeTab: TFilterTab;
  onTabChange: (tab: TFilterTab) => void;
  stats: IStats;
  activeTheme: any;
}

export const FilterTabs = memo(({ activeTab, onTabChange, stats, activeTheme }: IProps) => {
  const tabs = [
    { id: "all" as const, label: "Все", count: stats.total },
    { id: "active" as const, label: "Активные", count: stats.inProgress },
    { id: "completed" as const, label: "Завершенные", count: stats.completed },
    { id: "overdue" as const, label: "Просроченные", count: stats.overdue },
  ];

  return (
    <div className="flex! gap-2! px-6! py-3!">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full! px-4! py-1.5! text-xs! font-semibold! transition-all! duration-200! cursor-pointer! flex! items-center! gap-1.5! border-0! ${
              isActive
                ? `bg-gradient-to-r! ${activeTheme.gradient} text-white! shadow-md!`
                : "bg-zinc-100! dark:bg-zinc-800! text-zinc-500! dark:text-zinc-400! hover:bg-zinc-200! dark:hover:bg-zinc-700!"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5! py-0.5! rounded-full! text-[10px]! font-bold! ${
                isActive ? "bg-white/25! text-white!" : "bg-zinc-200/70! dark:bg-zinc-700! text-zinc-500! dark:text-zinc-400!"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
});
