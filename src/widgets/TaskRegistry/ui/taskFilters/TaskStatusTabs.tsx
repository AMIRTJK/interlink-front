import { cn } from "@shared/lib";
import type { TaskStatsFull, TaskStatus } from "../../model/types";
import { SEGMENT_ACTIVE, SEGMENT_IDLE, SEGMENT_ITEM, SEGMENT_TRACK } from "./model";

const STATUS_TABS: { value: TaskStatus | ""; label: string; statKey: keyof TaskStatsFull }[] = [
  { value: "", label: "Все", statKey: "total" },
  { value: "new", label: "Новая", statKey: "new" },
  { value: "in_progress", label: "В работе", statKey: "in_progress" },
  { value: "review", label: "На проверке", statKey: "review" },
  { value: "completed", label: "Завершена", statKey: "completed" },
  { value: "overdue", label: "Просрочена", statKey: "overdue" },
];

interface IProps {
  value: TaskStatus | "";
  stats: TaskStatsFull | null;
  onChange: (status: TaskStatus | "") => void;
}

/** Быстрый фильтр по статусу — единственный выбор статуса на экране. */
export const TaskStatusTabs = ({ value, stats, onChange }: IProps) => (
  <div className="min-w-0 overflow-x-auto no-scrollbar">
    <div role="tablist" aria-label="Статус задач" className={cn(SEGMENT_TRACK, "w-max")}>
      {STATUS_TABS.map((tab) => {
        const isActive = value === tab.value;
        const count = stats ? Number(stats[tab.statKey] ?? 0) : 0;
        return (
          <button
            key={tab.value || "all"}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(SEGMENT_ITEM, isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE)}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "min-w-5 h-5 px-1.5 rounded-full text-[10px] font-extrabold tabular-nums flex items-center justify-center",
                isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600 dark:bg-th-high dark:text-slate-300",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
