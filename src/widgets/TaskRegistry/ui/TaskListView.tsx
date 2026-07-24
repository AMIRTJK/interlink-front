import * as React from "react";
import { Search, ChevronUp, MoreVertical, Paperclip, FileText } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Task } from "../model/types";
import type { Pagination } from "../model/api";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../lib/helpers";
import { Avatar } from "./Avatar";
import { CountdownTimer, LiveCountdown } from "./Countdown";

interface TaskListViewProps {
  tasks: Task[];
  pagination: Pagination;
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onOpenTask: (task: Task) => void;
}

export const TaskListView = ({ tasks, pagination, page, onPageChange, isLoading, onOpenTask }: TaskListViewProps) => {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const totalPages = Math.max(1, pagination.lastPage);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = pagination.total === 0 ? 0 : (safePage - 1) * pagination.perPage + 1;
  const rangeEnd = (safePage - 1) * pagination.perPage + tasks.length;

  const toggleSelectAll = () => setSelectedTasks((prev) => (prev.length === tasks.length ? [] : tasks.map((t) => t.id)));
  const toggleSelect = (id: string) => setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-none overflow-hidden flex flex-col min-h-[500px]">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-800/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-white/20 dark:border-white/10">
              <th className="px-8 py-5 w-16"><input type="checkbox" checked={selectedTasks.length > 0 && selectedTasks.length === tasks.length} onChange={toggleSelectAll} className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" /></th>
              <th className="px-6 py-5 w-24">ID</th>
              <th className="px-6 py-5">Название задачи</th>
              <th className="px-6 py-5 w-40">Приоритет</th>
              <th className="px-6 py-5 w-40">Статус</th>
              <th className="px-6 py-5 w-48">Исполнитель</th>
              <th className="px-6 py-5 w-40">Срок</th>
              <th className="px-6 py-5 w-32">Прогресс</th>
              <th className="px-6 py-5 w-44">Обратный отсчёт</th>
              <th className="px-6 py-5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
            <If is={tasks.length > 0}>
              {tasks.map((task, index) => {
                const pMeta = getPriorityMeta(task.priority);
                const sMeta = getStatusMeta(task.status);
                const isSelected = selectedTasks.includes(task.id);
                const nameParts = task.assignee.name.split(" ");
                return (
                  <tr
                    key={task.id}
                    className={cn(
                      "group transition-all duration-150 cursor-pointer relative",
                      isSelected ? "bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-50/80" : index % 2 === 0 ? "bg-white/20 dark:bg-white/[0.02] hover:bg-white/60 dark:hover:bg-white/5" : "bg-transparent hover:bg-white/60 dark:hover:bg-white/5",
                    )}
                    onClick={() => onOpenTask(task)}
                  >
                    <td className="px-8 py-5" onClick={(e) => { e.stopPropagation(); toggleSelect(task.id); }}>
                      <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" />
                    </td>
                    <td className="px-6 py-5 text-xs font-mono font-black text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">{task.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors inline-flex items-center gap-2">
                          <If is={task.tags.includes("протокол")}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-600 shrink-0"><FileText size={13} /></span>
                          </If>
                          {task.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", tag === "протокол" ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 border-violet-200/60 dark:border-violet-800" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/10")}>{tag}</span>
                          ))}
                          <If is={task.tags.length > 3}><span className="text-[9px] font-bold text-slate-400">+{task.tags.length - 3}</span></If>
                          <If is={task.attachments.length > 0}><div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><Paperclip size={10} /> {task.attachments.length}</div></If>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm bg-white dark:bg-slate-800 border-slate-200/50 dark:border-white/10", pMeta.textColor)}>
                        <div className={cn("w-2 h-2 rounded-full", pMeta.color, "animate-pulse")} />
                        <span className="text-[11px] font-black uppercase tracking-tight">{pMeta.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm bg-white dark:bg-slate-800 border-slate-200/50 dark:border-white/10">
                        <div className={cn("w-2 h-2 rounded-full", sMeta.color)} />
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">{sMeta.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar colleague={task.assignee} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{nameParts[0]} {nameParts[1]?.[0]}{nameParts[1] ? "." : ""}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{task.assignee.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{task.dueDate ? formatDueDate(task.dueDate) : "—"}</span>
                        <If is={Boolean(task.dueDate) && task.status !== "completed" && getCountdown(task.dueDate!).type !== "overdue"}>
                          <CountdownTimer dueDate={task.dueDate!} />
                        </If>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{task.progress}%</span>
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                          <div className={cn("h-full rounded-full transition-all duration-500", task.progress === 100 ? "bg-emerald-500" : task.progress > 70 ? "bg-blue-500" : "bg-emerald-400")} style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><If is={Boolean(task.dueDate)}><LiveCountdown dueDate={task.dueDate!} /></If></td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </If>
            <If is={tasks.length === 0}>
              <tr>
                <td colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300"><Search size={24} /></div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{isLoading ? "Загрузка задач..." : "Ничего не найдено"}</p>
                    <p className="text-slate-400 text-xs">{isLoading ? "Пожалуйста, подождите" : "Попробуйте изменить параметры поиска или фильтры"}</p>
                  </div>
                </td>
              </tr>
            </If>
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-800/5 dark:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-400 border-t border-white/20 dark:border-white/10">
        <div className="flex items-center gap-6">
          <p>Показано {rangeStart}–{rangeEnd} из {pagination.total} задач</p>
          <If is={selectedTasks.length > 0}>
            <div className="flex items-center gap-3">
              <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
              <p className="text-emerald-600">Выбрано: {selectedTasks.length}</p>
              <button onClick={() => setSelectedTasks([])} className="hover:text-red-500">Сбросить</button>
            </div>
          </If>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(Math.max(1, safePage - 1))} disabled={safePage === 1} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 disabled:opacity-30 cursor-pointer">
            <ChevronUp className="-rotate-90" size={16} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => onPageChange(p)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer", p === safePage ? "bg-slate-800 dark:bg-slate-700 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-white/10")}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => onPageChange(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 disabled:opacity-30 cursor-pointer">
            <ChevronUp className="rotate-90" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
