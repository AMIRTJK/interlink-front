import React from "react";
import type { IUserAccessFilters } from "../../model";

interface IProps {
  filters: IUserAccessFilters;
  counters: { all: number; active: number; inactive: number; blocked: number };
  onFilterStatus: (status: string) => void;
}

export function UsersTabStatChips({ filters, counters, onFilterStatus }: IProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onFilterStatus("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          filters.status === "all"
            ? "bg-slate-200 text-slate-800 dark:bg-th-high dark:text-slate-100"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-th-base dark:text-slate-400 dark:hover:bg-th-high"
        }`}
      >
        <span>Всего</span>
        <span className="font-bold">{counters.all}</span>
      </button>
      <button
        onClick={() => onFilterStatus("active")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          filters.status === "active"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-400"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-th-base dark:text-slate-400 dark:hover:bg-th-high"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Активные</span>
        <span className="font-bold">{counters.active}</span>
      </button>
      <button
        onClick={() => onFilterStatus("inactive")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          filters.status === "inactive"
            ? "bg-slate-200 text-slate-700 dark:bg-th-high dark:text-slate-300"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-th-base dark:text-slate-400 dark:hover:bg-th-high"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Неактивные</span>
        <span className="font-bold">{counters.inactive}</span>
      </button>
      <button
        onClick={() => onFilterStatus("blocked")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          filters.status === "blocked"
            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/35 dark:text-rose-400"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-th-base dark:text-slate-400 dark:hover:bg-th-high"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Заблокированные</span>
        <span className="font-bold">{counters.blocked}</span>
      </button>
    </div>
  );
}
