import * as React from "react";
import { Search, Plus, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import { Select, DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn, useDebouncedCallback } from "@shared/lib";
import { If } from "@shared/ui";
import type { Colleague, Priority, TaskStatsFull, TaskStatus } from "../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../model/constants";
import {
  type TaskDisplayMode,
  type TaskFilters,
} from "../model/filters";

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

const STATUS_TABS: { value: TaskStatus | ""; label: string; statKey: keyof TaskStatsFull | "total" }[] = [
  { value: "", label: "Все", statKey: "total" },
  { value: "in_progress", label: "Активные", statKey: "active" },
  { value: "completed", label: "Завершенные", statKey: "completed" },
  { value: "overdue", label: "Просроченные", statKey: "overdue" },
];

const customAntdTheme = {
  token: {
    borderRadius: 16,
    controlHeight: 36,
    fontSize: 12,
    colorPrimary: "#6366f1",
    colorBgContainer: "rgba(255, 255, 255, 0.8)",
  },
};

export const TasksFilterBar = ({
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

  return (
    <div className="flex flex-col gap-4">
      <ConfigProvider theme={customAntdTheme}>
        {/* Row 1: Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority filter pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Приоритет:</span>
            <Select
              variant="borderless"
              value={filters.priority || undefined}
              placeholder="Все приоритеты"
              onChange={(val) => onFilterChange({ priority: (val || "") as Priority })}
              allowClear
              options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              className="min-w-[130px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Assignee filter pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Исполнитель:</span>
            <Select
              variant="borderless"
              value={filters.assigneeId ? String(filters.assigneeId) : undefined}
              placeholder="Все исполнители"
              onChange={(val) => onFilterChange({ assigneeId: val || "" })}
              allowClear
              showSearch
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              options={colleagues.map((c) => ({ value: String(c.id), label: c.name }))}
              className="min-w-[145px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Status filter pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Статус:</span>
            <Select
              variant="borderless"
              value={filters.status || undefined}
              placeholder="Все статусы"
              onChange={(val) => onFilterChange({ status: (val || "") as TaskStatus })}
              allowClear
              options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              className="min-w-[125px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Progress filter pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Прогресс:</span>
            <Select
              variant="borderless"
              defaultValue="all"
              options={[
                { value: "all", label: "Все" },
                { value: "in_progress", label: "В процессе" },
                { value: "done", label: "100%" },
              ]}
              className="min-w-[90px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Name filter pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Название:</span>
            <Select
              variant="borderless"
              defaultValue="all"
              options={[{ value: "all", label: "Все названия" }]}
              className="min-w-[130px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Deadline DatePicker pill */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <Calendar size={14} className="text-slate-400 mr-1.5 shrink-0" />
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Дедлайн:</span>
            <DatePicker
              variant="borderless"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(d) => onFilterChange({ date: d ? d.format("YYYY-MM-DD") : "" })}
              format="DD.MM.YYYY"
              placeholder="ДД.ММ.ГГГГ"
              allowClear
              className="w-[125px] font-bold text-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
      </ConfigProvider>

      {/* Row 2: Controls Bar (View switcher, Search input, Create button) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-1">
        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/50 dark:border-white/10">
          <button
            onClick={() => onDisplayModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              displayMode === "table"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            )}
          >
            <ListIcon size={14} /> Список
          </button>
          <button
            onClick={() => onDisplayModeChange("board")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              displayMode === "board"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            )}
          >
            <LayoutGrid size={14} /> Доска
          </button>
        </div>

        {/* Central Oval Search Bar */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Поиск"
            value={searchLocal}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-gradient-to-b from-slate-100/90 to-slate-200/40 dark:from-slate-800/90 dark:to-slate-800/40 border border-slate-200/70 dark:border-white/10 rounded-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400 text-center"
          />
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-b from-white to-slate-50/90 dark:from-slate-800 dark:to-slate-800/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
        >
          <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Plus size={13} strokeWidth={3} />
          </div>
          <span className="text-xs font-extrabold text-blue-500 dark:text-blue-400">Создать</span>
        </button>
      </div>

      {/* Row 3: Centered Quick Status Tabs */}
      <div className="flex items-center justify-center">
        <nav className="flex items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.value;
            const countVal = stats
              ? (stats[tab.statKey] as number) ?? 0
              : 0;

            return (
              <button
                key={tab.value || "all"}
                onClick={() => onFilterChange({ status: tab.value })}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-500 border border-slate-200/60 dark:border-white/10 hover:border-purple-300",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                    active ? "bg-purple-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                  )}
                >
                  {countVal}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
