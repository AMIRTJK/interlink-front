import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Paperclip,
  FileText,
} from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { FilterTabId, SortConfig, Task, TaskStats } from "../model/types";
import { STAT_CARDS, FILTER_TABS, SORT_OPTIONS } from "../model/constants";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../lib/helpers";
import { Avatar } from "./Avatar";
import { CountdownTimer, LiveCountdown } from "./Countdown";

// Реестр задач: не более 7 записей на одну страницу.
const PER_PAGE = 7;

interface TaskListViewProps {
  tasks: Task[];
  /** Статистика с бэкенда для верхних карточек (если недоступна — считаем локально). */
  stats?: TaskStats | null;
  isLoading?: boolean;
  onOpenTask: (task: Task) => void;
  onCreate: () => void;
}

export const TaskListView = ({
  tasks,
  stats: apiStats,
  isLoading,
  onOpenTask,
  onCreate,
}: TaskListViewProps) => {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<FilterTabId>("all");
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: "dueDate",
    direction: "asc",
  });
  const [page, setPage] = React.useState(1);

  const localStats: TaskStats = React.useMemo(() => {
    return {
      total: tasks.length,
      inProgress: tasks.filter(
        (t) => t.status === "in_progress" || t.status === "new" || t.status === "review",
      ).length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(
        (t) =>
          t.status === "overdue" ||
          (new Date(t.dueDate).getTime() < new Date().getTime() &&
            t.status !== "completed"),
      ).length,
    };
  }, [tasks]);

  // Верхние карточки — из API (точный total по всем задачам), вкладки-фильтры —
  // локально, т.к. отражают текущую загруженную выборку.
  const stats = localStats;
  const topStats = apiStats ?? localStats;

  const filteredTasks = React.useMemo(() => {
    const result = tasks.filter((task) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        task.assignee.name.toLowerCase().includes(searchLower) ||
        task.id.toLowerCase().includes(searchLower) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      const now = new Date().getTime();
      const isOverdue =
        new Date(task.dueDate).getTime() < now && task.status !== "completed";
      const matchesTab =
        filterTab === "all" ||
        (filterTab === "active" &&
          ["new", "in_progress", "review"].includes(task.status) &&
          !isOverdue) ||
        (filterTab === "completed" && task.status === "completed") ||
        (filterTab === "overdue" && (task.status === "overdue" || isOverdue));
      return matchesSearch && matchesTab;
    });
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortConfig.key === "priority") {
        valA = getPriorityMeta(a.priority).rank;
        valB = getPriorityMeta(b.priority).rank;
      } else if (sortConfig.key === "status") {
        valA = getStatusMeta(a.status).rank;
        valB = getStatusMeta(b.status).rank;
      } else {
        valA = new Date(a.dueDate).getTime();
        valB = new Date(b.dueDate).getTime();
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [tasks, searchQuery, filterTab, sortConfig]);

  // Пагинация: показываем не больше PER_PAGE записей на страницу.
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = filteredTasks.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );
  const rangeStart = filteredTasks.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const rangeEnd = (safePage - 1) * PER_PAGE + pagedTasks.length;

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const requestSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  return (
    <motion.main
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-10 relative z-10 flex flex-col gap-8"
    >
      {/* Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-white/10 rounded-3xl shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform duration-300"
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                  stat.bg,
                  stat.color,
                )}
              >
                <Icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
                  {topStats[stat.key]}
                </p>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Glass Container */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-none overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-8 border-b border-white/20 dark:border-white/10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Реестр задач
              </h1>
              <span className="px-2.5 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg shadow-md shadow-slate-200 dark:shadow-none">
                {filteredTasks.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group w-72">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Поиск по названию, ID или тегам..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/60 border border-white/20 dark:border-white/10 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <div className="h-10 w-px bg-slate-200/50 dark:bg-white/10 mx-2 hidden md:block" />

              <button
                onClick={onCreate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 hover:brightness-110 rounded-2xl text-sm font-bold text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={18} />
                Создать задачу
              </button>
            </div>
          </div>

          {/* Filter Tabs & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex p-1.5 bg-slate-200/40 dark:bg-slate-800/60 rounded-2xl backdrop-blur-md">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterTab(tab.id);
                    setPage(1);
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                    filterTab === tab.id
                      ? "text-white shadow-lg shadow-emerald-900/10"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/5",
                  )}
                >
                  {filterTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={cn(
                      "relative z-10 text-[10px] px-1.5 py-0.5 rounded-md",
                      filterTab === tab.id ? "bg-white/20" : "bg-slate-300/40 dark:bg-white/10",
                    )}
                  >
                    {stats[tab.statKey]}
                  </span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Filter size={14} />
                Сортировка:
              </div>
              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => requestSort(opt.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-tight transition-all",
                      sortConfig.key === opt.id
                        ? "bg-slate-800 dark:bg-slate-700 border-slate-800 dark:border-slate-700 text-white shadow-lg"
                        : "bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300",
                    )}
                  >
                    {opt.label}
                    {sortConfig.key === opt.id &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-800/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-white/20 dark:border-white/10">
                <th className="px-8 py-5 w-16">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 w-24">ID</th>
                <th className="px-6 py-5">Название задачи</th>
                <th
                  className="px-6 py-5 w-40 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                  onClick={() => requestSort("priority")}
                >
                  <div className="flex items-center gap-1.5">
                    Приоритет
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform",
                        sortConfig.key === "priority" && sortConfig.direction === "desc"
                          ? "rotate-180"
                          : "",
                      )}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-5 w-40 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center gap-1.5">
                    Статус
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform",
                        sortConfig.key === "status" && sortConfig.direction === "desc"
                          ? "rotate-180"
                          : "",
                      )}
                    />
                  </div>
                </th>
                <th className="px-6 py-5 w-48">Исполнитель</th>
                <th
                  className="px-6 py-5 w-40 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                  onClick={() => requestSort("dueDate")}
                >
                  <div className="flex items-center gap-1.5">
                    Срок
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform",
                        sortConfig.key === "dueDate" && sortConfig.direction === "desc"
                          ? "rotate-180"
                          : "",
                      )}
                    />
                  </div>
                </th>
                <th className="px-6 py-5 w-32">Прогресс</th>
                <th className="px-6 py-5 w-44">Обратный отсчёт</th>
                <th className="px-6 py-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
              <AnimatePresence initial={false}>
                {filteredTasks.length > 0 ? (
                  pagedTasks.map((task, index) => {
                    const pMeta = getPriorityMeta(task.priority);
                    const sMeta = getStatusMeta(task.status);
                    const isSelected = selectedTasks.includes(task.id);
                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "group transition-all duration-200 cursor-pointer relative",
                          isSelected
                            ? "bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50/80"
                            : cn(
                                index % 2 === 0
                                  ? "bg-white/20 dark:bg-white/[0.02]"
                                  : "bg-transparent",
                                "hover:bg-white/60 dark:hover:bg-white/5",
                              ),
                        )}
                        onClick={() => onOpenTask(task)}
                      >
                        <td
                          className="px-8 py-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(task.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                          />
                        </td>
                        <td
                          className={cn(
                            "px-6 py-5 text-xs font-mono font-black transition-colors",
                            task.id.startsWith("PROTO-")
                              ? "text-violet-500 group-hover:text-violet-600"
                              : "text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200",
                          )}
                        >
                          {task.id}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors inline-flex items-center gap-2">
                              {task.id.startsWith("PROTO-") && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-600 shrink-0">
                                  <FileText size={13} />
                                </span>
                              )}
                              {task.title}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {task.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                    tag === "протокол"
                                      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 border-violet-200/60 dark:border-violet-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/10",
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  +{task.tags.length - 3}
                                </span>
                              )}
                              {task.attachments.length > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                  <Paperclip size={10} /> {task.attachments.length}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm",
                              pMeta.textColor,
                              "bg-white dark:bg-slate-800 border-slate-200/50 dark:border-white/10",
                            )}
                          >
                            <div className={cn("w-2 h-2 rounded-full", pMeta.color, "animate-pulse")} />
                            <span className="text-[11px] font-black uppercase tracking-tight">
                              {pMeta.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm bg-white dark:bg-slate-800 border-slate-200/50 dark:border-white/10">
                            <div className={cn("w-2 h-2 rounded-full", sMeta.color)} />
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">
                              {sMeta.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar colleague={task.assignee} />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {task.assignee.name.split(" ")[0]}{" "}
                                {task.assignee.name.split(" ")[1]?.[0]}.
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {task.assignee.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {formatDueDate(task.dueDate)}
                            </span>
                            <If is={task.status !== "completed" && getCountdown(task.dueDate).type !== "overdue"}>
                              <CountdownTimer dueDate={task.dueDate} />
                            </If>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  task.progress === 100
                                    ? "bg-emerald-500"
                                    : task.progress > 70
                                      ? "bg-blue-500"
                                      : "bg-emerald-400",
                                )}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <LiveCountdown dueDate={task.dueDate} />
                        </td>
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold">
                          {isLoading ? "Загрузка задач..." : "Ничего не найдено"}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {isLoading
                            ? "Пожалуйста, подождите"
                            : "Попробуйте изменить параметры поиска или фильтры"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-800/5 dark:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-400 border-t border-white/20 dark:border-white/10">
          <div className="flex items-center gap-6">
            <p>
              Показано {rangeStart}–{rangeEnd} из {filteredTasks.length} задач
            </p>
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
                <p className="text-emerald-600">Выбрано: {selectedTasks.length}</p>
                <button onClick={() => setSelectedTasks([])} className="hover:text-red-500">
                  Сбросить
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp className="-rotate-90" size={16} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                    p === safePage
                      ? "bg-slate-800 dark:bg-slate-700 text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-white/10",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp className="rotate-90" size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
};
