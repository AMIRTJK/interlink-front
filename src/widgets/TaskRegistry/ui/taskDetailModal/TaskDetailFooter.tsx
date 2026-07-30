import * as React from "react";
import { Trash2, Pencil } from "lucide-react";
import { If } from "@shared/ui";
import type { Task } from "../../model/types";

interface IProps {
  task: Task;
  busy: boolean;
  confirmDelete: boolean;
  onConfirmDeleteChange: (val: boolean) => void;
  onDelete?: (task: Task) => Promise<void> | void;
  onHandleDelete: () => void;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export function TaskDetailFooter({
  task,
  busy,
  confirmDelete,
  onConfirmDeleteChange,
  onDelete,
  onHandleDelete,
  onClose,
  onEdit,
}: IProps) {
  return (
    <div className="p-6 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-white/10 flex justify-between gap-3">
      <If is={Boolean(onDelete)}>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Удалить задачу?
            </span>
            <button
              onClick={onHandleDelete}
              disabled={busy}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-60"
            >
              Да, удалить
            </button>
            <button
              onClick={() => onConfirmDeleteChange(false)}
              disabled={busy}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => onConfirmDeleteChange(true)}
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-60"
          >
            <Trash2 size={16} />
            Удалить
          </button>
        )}
      </If>
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          Закрыть
        </button>
        <If is={Boolean(onEdit)}>
          <button
            onClick={() => onEdit?.(task)}
            disabled={busy || task.rawId == null}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            <Pencil size={16} />
            Редактировать
          </button>
        </If>
      </div>
    </div>
  );
}
