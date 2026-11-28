import * as React from "react";
import { Search, Plus, LayoutGrid, List as ListIcon, X } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn, useDebouncedCallback } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import type { Colleague, TaskStatsFull } from "../model/types";
import type { TaskDisplayMode, TaskFilters } from "../model/filters";
import { TaskStatusTabs } from "./taskFilters/TaskStatusTabs";
import { TaskFilterSelects } from "./taskFilters/TaskFilterSelects";
import { FIELD, SEGMENT_ACTIVE, SEGMENT_IDLE, SEGMENT_ITEM, SEGMENT_TRACK } from "./taskFilters/model";

dayjs.locale("ru");

interface IProps {
  filters: TaskFilters;
  onFilterChange: (patch: Partial<TaskFilters>) => void;
  stats: TaskStatsFull | null;
  colleagues: Colleague[];
  displayMode: TaskDisplayMode;
  onDisplayModeChange: (mode: TaskDisplayMode) => void;
  onCreate: () => void;
  count: number;
}

const DISPLAY_MODES: { value: TaskDisplayMode; label: string; icon: typeof ListIcon }[] = [
  { value: "table", label: "Список", icon: ListIcon },
  { value: "board", label: "Доска", icon: LayoutGrid },
];

/**
 * Панель реестра задач: одна стеклянная панель из двух строк.
 * Сверху — что показывать (статус, вид) и главное действие, снизу — уточнение
 * выборки (поиск и фильтры). Статус выбирается только вкладками: отдельный
 * выпадающий «Статус» дублировал их.
 */
export const TasksFilterBar = React.memo(({
  filters,
  onFilterChange,
  stats,
  colleagues,
  displayMode,
  onDisplayModeChange,
  onCreate,
}: IProps) => {
  const [searchLocal, setSearchLocal] = React.useState(filters.search);

  React.useEffect(() => {
    setSearchLocal(filters.search);
  }, [filters.search]);

  const debouncedSearch = useDebouncedCallback((val: unknown) => {
    onFilterChange({ search: String(val ?? "") });
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchLocal(val);
    debouncedSearch(val);
  };

  const handleSearchClear = () => {
    setSearchLocal("");
    onFilterChange({ search: "" });
  };

  return (
    <div className="ui-glass flex flex-col gap-3 rounded-3xl border border-zinc-200 dark:border-th-high/50 bg-white/70 dark:bg-th-raised/90 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskStatusTabs
          value={filters.status}
          stats={stats}
          onChange={(status) => onFilterChange({ status })}
        />

        <div className="flex items-center gap-3">
          <div role="tablist" aria-label="Вид списка" className={SEGMENT_TRACK}>
            {DISPLAY_MODES.map(({ value, label, icon: Icon }) => {
              const isActive = displayMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onDisplayModeChange(value)}
                  className={cn(SEGMENT_ITEM, isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="h-9 flex items-center gap-1.5 px-4 rounded-full border-0 bg-th-accent-600 hover:bg-th-accent-700 text-white text-xs font-bold shadow-sm shadow-th-accent-600/25 cursor-pointer transition-colors active:scale-95"
          >
            <Plus size={15} strokeWidth={2.5} />
            Создать задачу
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(FIELD, "relative w-full sm:w-72")}>
          <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск по задачам"
            aria-label="Поиск по задачам"
            value={searchLocal}
            onChange={handleSearchChange}
            className="h-full w-full bg-transparent pl-10 pr-9 rounded-full outline-none focus:ring-2 focus:ring-th-accent-500/25 text-xs font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchLocal ? (
            <Tooltip title="Очистить">
              <button
                type="button"
                onClick={handleSearchClear}
                aria-label="Очистить поиск"
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </Tooltip>
          ) : null}
        </div>

        <TaskFilterSelects filters={filters} colleagues={colleagues} onFilterChange={onFilterChange} />
      </div>
    </div>
  );
});
