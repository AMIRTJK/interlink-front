import * as React from "react";
import { Search, ChevronUp } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Task, Priority, TaskStatus } from "../model/types";
import type { Pagination } from "../model/api";
import { formatDueDate } from "../lib/helpers";
import { Avatar } from "./Avatar";
import { LiveCountdown } from "./Countdown";

interface TaskListViewProps {
  tasks: Task[];
  pagination: Pagination;
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onOpenTask: (task: Task) => void;
}

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case "critical":
      return {
        label: "Критический",
        dotBg: "bg-rose-500",
        pillClass: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-900/50 text-rose-700 dark:text-rose-300",
      };
    case "high":
      return {
        label: "Высокий",
        dotBg: "bg-amber-500",
        pillClass: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/50 text-amber-700 dark:text-amber-300",
      };
    case "medium":
      return {
        label: "Средний",
        dotBg: "bg-blue-500",
        pillClass: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-900/50 text-blue-700 dark:text-blue-300",
      };
    case "low":
    default:
      return {
        label: "Низкий",
        dotBg: "bg-slate-400",
        pillClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300",
      };
  }
};

const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case "overdue":
      return {
        label: "Просрочена",
        dotBg: "bg-rose-500",
        pillClass: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-900/50 text-rose-600 dark:text-rose-400",
      };
    case "completed":
      return {
        label: "Завершена",
        dotBg: "bg-emerald-500",
        pillClass: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
      };
    case "review":
      return {
        label: "Ревью",
        dotBg: "bg-amber-600",
        pillClass: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/50 text-amber-700 dark:text-amber-400",
      };
    case "in_progress":
      return {
        label: "В работе",
        dotBg: "bg-blue-500",
        pillClass: "bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
      };
    case "new":
    default:
      return {
        label: "Новая",
        dotBg: "bg-sky-500",
        pillClass: "bg-sky-50 dark:bg-sky-950/40 border-sky-200/70 dark:border-sky-900/50 text-sky-600 dark:text-sky-400",
      };
  }
};

export const TaskListView = ({
  tasks,
  pagination,
  page,
  onPageChange,
  isLoading,
  onOpenTask,
}: TaskListViewProps) => {
  const totalPages = Math.max(1, pagination.lastPage);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (safePage - 1) * pagination.perPage + 1;
  const rangeEnd = (safePage - 1) * pagination.perPage + tasks.length;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-100 dark:border-white/10 rounded-3xl p-5 shadow-xl shadow-purple-100/40 dark:shadow-none flex flex-col min-h-[500px]">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-center border-separate border-spacing-y-2.5 min-w-[1000px]">
          <thead>
            <tr className="text-[11px] font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
              <th className="px-4 py-2 w-28 text-center">КОД</th>
              <th className="px-4 py-2 text-center">НАЗВАНИЕ</th>
              <th className="px-4 py-2 w-52 text-left">ИСПОЛНИТЕЛЬ</th>
              <th className="px-4 py-2 w-40 text-center">ПРИОРИТЕТ</th>
              <th className="px-4 py-2 w-40 text-center">СТАТУС</th>
              <th className="px-4 py-2 w-32 text-center">СРОК</th>
              <th className="px-4 py-2 w-48 text-center">ОБРАТНЫЙ ОТСЧЁТ</th>
            </tr>
          </thead>
          <tbody>
            <If is={tasks.length > 0}>
              {tasks.map((task) => {
                const priorityBadge = getPriorityBadge(task.priority);
                const statusBadge = getStatusBadge(task.status);

                return (
                  <tr
                    key={task.id}
                    onClick={() => onOpenTask(task)}
                    className="bg-white dark:bg-slate-800/80 hover:bg-slate-50/90 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xs transition-all duration-150 cursor-pointer group"
                  >
                    {/* CODE */}
                    <td className="px-4 py-3.5 rounded-l-2xl text-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                        {task.id}
                      </span>
                    </td>

                    {/* TITLE */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-block max-w-xs bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 rounded-2xl px-6 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                        {task.title}
                      </div>
                    </td>

                    {/* ASSIGNEE */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-3">
                        <Avatar colleague={task.assignee} className="w-8 h-8 text-xs font-bold" />
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {task.assignee.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.assignee.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PRIORITY */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border text-xs font-bold shadow-2xs",
                          priorityBadge.pillClass,
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full", priorityBadge.dotBg)} />
                        <span>{priorityBadge.label}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border text-xs font-bold shadow-2xs",
                          statusBadge.pillClass,
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full", statusBadge.dotBg)} />
                        <span>{statusBadge.label}</span>
                      </div>
                    </td>

                    {/* DUE DATE */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                        {task.dueDate ? formatDueDate(task.dueDate) : "—"}
                      </span>
                    </td>

                    {/* COUNTDOWN */}
                    <td className="px-4 py-3.5 rounded-r-2xl text-center">
                      <If is={Boolean(task.dueDate)}>
                        <LiveCountdown dueDate={task.dueDate!} />
                      </If>
                    </td>
                  </tr>
                );
              })}
            </If>

            <If is={tasks.length === 0}>
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                      <Search size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                      {isLoading ? "Загрузка задач..." : "Ничего не найдено"}
                    </p>
                  </div>
                </td>
              </tr>
            </If>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pt-4 px-2 flex items-center justify-between text-xs font-bold text-slate-400 border-t border-slate-100 dark:border-white/10 mt-2">
        <p>
          Показано {rangeStart}–{rangeEnd} из {pagination.total} задач
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
          >
            <ChevronUp className="-rotate-90" size={16} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-xs",
                  p === safePage
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
          >
            <ChevronUp className="rotate-90" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
