import * as React from "react";
import { Search, Plus, Calendar, LayoutGrid, List as ListIcon, X } from "lucide-react";
import { Select, DatePicker, ConfigProvider, theme } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn, useDebouncedCallback, useIsDarkMode } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import type { Colleague, Priority, TaskStatsFull, TaskStatus } from "../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../model/constants";
import type { TaskDisplayMode, TaskFilters } from "../model/filters";

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
  { value: "new", label: "Новая", statKey: "new" },
  { value: "in_progress", label: "В работе", statKey: "in_progress" },
  { value: "review", label: "На проверке", statKey: "review" },
  { value: "completed", label: "Завершена", statKey: "completed" },
  { value: "overdue", label: "Просрочена", statKey: "overdue" },
];

const getAntdTheme = (isDark: boolean) => ({
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    borderRadius: 16,
    controlHeight: 36,
    fontSize: 12,
    colorTextPlaceholder: isDark ? "rgba(255, 255, 255, 0.45)" : "#94a3b8",
    colorText: isDark ? "#f1f5f9" : "#334155",
    colorBgContainer: isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
  },
});

export const TasksFilterBar = React.memo(({
  filters,
  onFilterChange,
  stats,
  colleagues,
  displayMode,
  onDisplayModeChange,
  onCreate,
}: IProps) => {
  const isDark = useIsDarkMode();
  const antdTheme = React.useMemo(() => getAntdTheme(isDark), [isDark]);
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
      <ConfigProvider theme={antdTheme}>
        {/* Row 1: Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority filter pill */}
          <Tooltip title={PRIORITY_OPTIONS.find((o) => o.value === filters.priority)?.label}>
            <div className="flex items-center ui-glass-soft bg-slate-100/80 dark:bg-th-raised/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Приоритет:</span>
              <Select
                variant="borderless"
                value={filters.priority || undefined}
                placeholder="Все приоритеты"
                onChange={(val) => onFilterChange({ priority: (val || "") as Priority })}
                allowClear
                options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-[130px] font-bold text-slate-700 dark:text-slate-100 [&_.ant-select-selection-placeholder]:text-slate-400! dark:[&_.ant-select-selection-placeholder]:text-slate-400!"
              />
            </div>
          </Tooltip>

          {/* Assignee filter pill */}
          <Tooltip title={colleagues.find((c) => String(c.id) === String(filters.assigneeId))?.name}>
            <div className="flex items-center ui-glass-soft bg-slate-100/80 dark:bg-th-raised/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
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
                className="w-[155px] font-bold text-slate-700 dark:text-slate-100 [&_.ant-select-selection-placeholder]:text-slate-400! dark:[&_.ant-select-selection-placeholder]:text-slate-400!"
              />
            </div>
          </Tooltip>

          {/* Status filter pill */}
          <Tooltip title={STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}>
            <div className="flex items-center ui-glass-soft bg-slate-100/80 dark:bg-th-raised/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Статус:</span>
              <Select
                variant="borderless"
                value={filters.status || undefined}
                placeholder="Все статусы"
                onChange={(val) => onFilterChange({ status: (val || "") as TaskStatus })}
                allowClear
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-[125px] font-bold text-slate-700 dark:text-slate-100 [&_.ant-select-selection-placeholder]:text-slate-400! dark:[&_.ant-select-selection-placeholder]:text-slate-400!"
              />
            </div>
          </Tooltip>

          {/* Deadline DatePicker pill */}
          <div className="flex items-center ui-glass-soft bg-slate-100/80 dark:bg-th-raised/80 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3 py-1 text-xs">
            <Calendar size={14} className="text-slate-400 mr-1.5 shrink-0" />
            <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">Дедлайн:</span>
            <DatePicker
              variant="borderless"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(d) => onFilterChange({ date: d ? d.format("YYYY-MM-DD") : "" })}
              format="DD.MM.YYYY"
              placeholder="ДД.ММ.ГГГГ"
              allowClear
              className="w-[115px] font-bold text-slate-700 dark:text-slate-100 [&_input::placeholder]:text-slate-400! dark:[&_input::placeholder]:text-slate-400!"
            />
          </div>
        </div>
      </ConfigProvider>

      {/* Row 2: Controls Bar (View switcher, Search input, Create button) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-1">
        {/* View Switcher */}
        <div className="flex items-center gap-1 ui-glass-soft bg-slate-100/70 dark:bg-th-raised/70 p-1 rounded-2xl border border-slate-200/50 dark:border-white/10">
          <button
            onClick={() => onDisplayModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              displayMode === "table"
                ? "bg-white dark:bg-th-high text-th-accent-600 dark:text-th-accent-400 shadow-xs"
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
                ? "bg-white dark:bg-th-high text-th-accent-600 dark:text-th-accent-400 shadow-xs"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
            )}
          >
            <LayoutGrid size={14} /> Доска
          </button>
        </div>

        {/* Central Oval Search Bar */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
          <input
            type="text"
            placeholder="Поиск"
            value={searchLocal}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 ui-glass-soft ui-glass--flat bg-gradient-to-b from-slate-100/90 to-slate-200/40 dark:from-th-raised/90 dark:to-th-raised/40 border border-slate-200/70 dark:border-white/10 rounded-full outline-none focus:ring-2 focus:ring-th-accent-500/20 transition-all text-xs font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400 text-center"
          />
          {searchLocal ? (
            <button
              type="button"
              onClick={() => {
                setSearchLocal("");
                onFilterChange({ search: "" });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5"
              title="Очистить"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Create Button */}
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-1.5 ui-glass-soft ui-glass--flat bg-gradient-to-b from-white to-slate-50/90 dark:from-th-raised dark:to-th-raised/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
        >
          <div className="w-5 h-5 rounded-md bg-th-accent-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Plus size={13} strokeWidth={3} />
          </div>
          <span className="text-xs font-extrabold text-th-accent-500 dark:text-th-accent-400">Создать</span>
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
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                  active
                    ? "bg-th-accent-600 border-th-accent-600 text-white shadow-md shadow-th-accent-200 dark:shadow-none"
                    : "bg-white/80 dark:bg-th-raised/80 text-slate-500 border-slate-200/60 dark:border-white/10 hover:border-purple-300",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shrink-0",
                    active ? "bg-th-accent-500 text-white" : "bg-slate-200 dark:bg-th-high text-slate-600 dark:text-slate-300",
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
});
