import React from "react";
import { ChevronUp, Search } from "lucide-react";
import { If } from "@shared/ui/If";
import { TaskRow } from "./TaskRow";
import type { IPersonalTask } from "../model/types";

interface IProps {
  tasks: IPersonalTask[];
  onOpen: (task: IPersonalTask) => void;
  onEdit: (task: IPersonalTask) => void;
  onDelete: (id: number) => void;
  userName: string;
}

const PER_PAGE = 7;

export const TasksTable = ({ tasks, onOpen, onEdit, onDelete, userName }: IProps) => {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [tasks]);

  const totalPages = Math.max(1, Math.ceil(tasks.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = tasks.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const rangeStart = tasks.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const rangeEnd = (safePage - 1) * PER_PAGE + pagedTasks.length;

  const toggleSelectAll = () => {
    if (selectedIds.length === tasks.length && tasks.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tasks.map((t) => t.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const isAllSelected = selectedIds.length > 0 && selectedIds.length === tasks.length;

  return (
    <div className="flex-1 flex flex-col min-h-[500px]">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[1020px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-800/80 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-10">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors border-zinc-300 dark:border-zinc-600 text-transparent hover:border-zinc-400 cursor-pointer ${
                    isAllSelected ? "bg-indigo-650 border-indigo-650 text-white!" : "bg-transparent"
                  }`}
                  aria-label="Выбрать все"
                >
                  <If is={isAllSelected}>
                    <span className="text-[10px] font-black leading-none">✓</span>
                  </If>
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-24">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 min-w-[240px]">Название</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-32">Приоритет</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-32">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 w-44">Исполнитель</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 min-w-[140px]">Прогресс</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 min-w-[160px]">Обратный отсчёт</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            <If is={tasks.length > 0}>
              {pagedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedIds.includes(task.id)}
                  onSelectToggle={toggleSelect}
                  onOpen={onOpen}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  userName={userName}
                />
              ))}
            </If>
            <If is={tasks.length === 0}>
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-350 dark:text-slate-600">
                      <Search size={32} />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold block">Ничего не найдено</span>
                    <span className="text-slate-400 text-sm block">Попробуйте изменить параметры поиска или фильтры</span>
                  </div>
                </td>
              </tr>
            </If>
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-800/5 dark:bg-white/5 flex items-center justify-between text-xs font-bold text-slate-400 border-t border-white/20 dark:border-white/10 mt-auto">
        <div className="flex items-center gap-6">
          <span>Показано {rangeStart}–{rangeEnd} из {tasks.length} задач</span>
          <If is={selectedIds.length > 0}>
            <div className="flex items-center gap-3">
              <div className="w-px h-4 bg-slate-300 dark:bg-white/10" />
              <span className="text-emerald-600">Выбрано: {selectedIds.length}</span>
              <button onClick={() => setSelectedIds([])} className="hover:text-red-500 border-0 bg-transparent cursor-pointer font-bold">Сбросить</button>
            </div>
          </If>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border-0 bg-transparent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          >
            <ChevronUp className="-rotate-90" size={16} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border-0 cursor-pointer ${
                  p === safePage
                    ? "bg-zinc-800 dark:bg-zinc-200 text-white! dark:text-zinc-900! font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border-0 bg-transparent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          >
            <ChevronUp className="rotate-90" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
