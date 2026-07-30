import * as React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Search, Plus, Filter, ArrowUp, ArrowDown, LayoutGrid, List as ListIcon, UserCheck } from "lucide-react";
import { Select, DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Colleague, Priority, TaskStatsFull, TaskStatus } from "../model/types";
import { PRIORITY_OPTIONS } from "../model/constants";
import {
  DATE_TYPE_OPTIONS,
  SORT_FIELD_OPTIONS,
  type TaskDateType,
  type TaskDisplayMode,
  type TaskFilters,
  type TaskSortField,
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
  { value: "new", label: "Новые", statKey: "new" },
  { value: "in_progress", label: "В работе", statKey: "in_progress" },
  { value: "review", label: "Ревью", statKey: "review" },
  { value: "completed", label: "Завершено", statKey: "completed" },
  { value: "overdue", label: "Просрочено", statKey: "overdue" },
];

const antdTheme = {
  token: { borderRadius: 12, controlHeight: 38, fontSize: 12, colorPrimary: "#10b981" },
};

export const TasksFilterBar = ({
  filters,
  onFilterChange,
  stats,
  colleagues,
  displayMode,
  onDisplayModeChange,
  onCreate,
  count,
}: IProps) => {
  const [searchLocal, setSearchLocal] = React.useState(filters.search);

  React.useEffect(() => {
    setSearchLocal(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    if (searchLocal === filters.search) return;
    const t = setTimeout(() => onFilterChange({ search: searchLocal }), 400);
    return () => clearTimeout(t);
  }, [searchLocal]);

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl shadow-sm p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Реестр задач</h1>
          <span className="w-7 h-6 flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-bold rounded-lg shrink-0">
            {count}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Поиск по названию, тегам..."
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
              className="w-full pl-12 pr-9 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/60 rounded-2xl">
            <button
              onClick={() => onDisplayModeChange("table")}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", displayMode === "table" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
            >
              <ListIcon size={15} /> Список
            </button>
            <button
              onClick={() => onDisplayModeChange("board")}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", displayMode === "board" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
            >
              <LayoutGrid size={15} /> Доска
            </button>
          </div>

          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 hover:brightness-110 rounded-2xl text-sm font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> Создать
          </button>
        </div>
      </div>

      <LayoutGroup id="statusTabsGroup">
        <nav className="flex flex-wrap gap-1.5 p-1.5 bg-slate-200/40 dark:bg-slate-800/60 rounded-2xl w-fit max-w-full">
          {STATUS_TABS.map((tab) => {
            const activeTab = filters.status === tab.value;
            const cnt = stats ? (stats[tab.statKey] as number) : undefined;
            return (
              <button
                key={tab.value || "all"}
                onClick={() => onFilterChange({ status: tab.value })}
                className={cn("relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer", activeTab ? "text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/5")}
              >
                <If is={activeTab}>
                  <motion.div
                    layoutId="activeStatusTabPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl"
                  />
                </If>
                <span className="relative z-10">{tab.label}</span>
                <If is={cnt != null}>
                  <span className={cn("relative z-10 text-[10px] font-bold w-6 h-5 flex items-center justify-center rounded-md shrink-0", activeTab ? "bg-white/20 text-white" : "bg-slate-300/40 dark:bg-white/10")}>
                    {cnt}
                  </span>
                </If>
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

      <ConfigProvider theme={antdTheme}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Filter size={14} /> Фильтры
          </div>

          <Select
            value={filters.priority || undefined}
            placeholder="Все приоритеты"
            onChange={(val) => onFilterChange({ priority: (val || "") as Priority })}
            allowClear
            options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            className="min-w-[150px]"
          />
          <Select
            value={filters.assigneeId ? String(filters.assigneeId) : undefined}
            placeholder="Все исполнители"
            onChange={(val) => onFilterChange({ assigneeId: val || "" })}
            allowClear
            showSearch
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={colleagues.map((c) => ({ value: String(c.id), label: c.name }))}
            className="min-w-[170px]"
          />
          <button onClick={() => onFilterChange({ mine: !filters.mine })} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer h-[38px]", filters.mine ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/60 dark:bg-slate-800/60 border-white/30 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-emerald-300")}>
            <UserCheck size={14} /> Только мои
          </button>
          <div className="flex items-center gap-2">
            <DatePicker
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(d) => onFilterChange({ date: d ? d.format("YYYY-MM-DD") : "" })}
              format="DD.MM.YYYY"
              placeholder="дд.мм.гггг"
              allowClear
              className="w-[140px]"
            />
            <If is={Boolean(filters.date)}>
              <Select value={filters.dateType} onChange={(val) => onFilterChange({ dateType: val as TaskDateType })} options={DATE_TYPE_OPTIONS.map((o) => ({ value: o.id, label: o.label }))} className="w-[130px]" />
            </If>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden lg:inline">Сортировка</span>
            <Select value={filters.sort} onChange={(val) => onFilterChange({ sort: val as TaskSortField })} options={SORT_FIELD_OPTIONS.map((o) => ({ value: o.id, label: o.label }))} className="w-[160px]" />
            <button onClick={() => onFilterChange({ dir: filters.dir === "asc" ? "desc" : "asc" })} disabled={filters.sort === "manual"} className="flex items-center gap-1 px-3 h-[38px] rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-300 transition-all disabled:opacity-40 cursor-pointer" title={filters.dir === "asc" ? "По возрастанию" : "По убыванию"}>
              {filters.dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            </button>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};
