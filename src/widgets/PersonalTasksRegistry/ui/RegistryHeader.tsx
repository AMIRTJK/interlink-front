import React from "react";
import { Search, Plus } from "lucide-react";
import { If } from "@shared/ui/If";
import type { TSortField, ISortConfig } from "../model/types";

interface IProps {
  taskCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortConfig: ISortConfig;
  onSortChange: (field: TSortField) => void;
  onCreateClick: () => void;
  activeTheme: any;
}

export const RegistryHeader = ({
  taskCount,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
  onCreateClick,
  activeTheme,
}: IProps) => {
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortLabels: Record<TSortField, string> = {
    dueDate: "По сроку",
    priority: "По приоритету",
    status: "По статусу",
  };

  return (
    <div className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-3 flex-wrap">
      <div className="flex-1 flex items-center gap-2">
        <div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white m-0">Реестр задач</h2>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 m-0">Мои задачи · {taskCount}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={15} />
        <input
          type="text"
          placeholder="Поиск задач..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-0 pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400 transition-all w-64 outline-none text-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setSortOpen(!sortOpen)}
          onBlur={() => setTimeout(() => setSortOpen(false), 200)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border-0 cursor-pointer bg-transparent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path></svg>
          <span className="hidden sm:inline">{sortLabels[sortConfig.field]}</span>
        </button>
        <If is={sortOpen}>
          <div className="absolute right-0 top-full mt-2 z-50 w-44 p-1.5 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col gap-0.5">
            {Object.entries(sortLabels).map(([key, label]) => {
              const isSelected = sortConfig.field === key;
              return (
                <button
                  key={key}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSortChange(key as TSortField);
                    setSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors border-0 cursor-pointer text-left ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span>{label}</span>
                  <If is={isSelected}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
                  </If>
                </button>
              );
            })}
          </div>
        </If>
      </div>

      <button
        onClick={onCreateClick}
        className={`flex items-center gap-2 bg-gradient-to-r ${activeTheme.gradient} text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-0 cursor-pointer`}
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Создать задачу</span>
      </button>
    </div>
  );
};
