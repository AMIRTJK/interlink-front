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
            ? "bg-slate-200 text-slate-800"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
        }`}
      >
        <span>Всего</span>
        <span className="font-bold">{counters.all}</span>
      </button>
      <button
        onClick={() => onFilterStatus("active")}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
          filters.status === "active"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
            ? "bg-slate-200 text-slate-700"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
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
            ? "bg-rose-100 text-rose-800"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Заблокированные</span>
        <span className="font-bold">{counters.blocked}</span>
      </button>
    </div>
  );
}
