import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, AlertTriangle, X } from "lucide-react";
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
    <div className="p-6 bg-slate-50/90 dark:bg-slate-800/80 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
      <If is={Boolean(onDelete)}>
        <div className="relative flex items-center min-h-[40px]">
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.92, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92, x: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center gap-3 p-1.5 pl-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle size={13} />
                  </div>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 pr-1">
                    Удалить задачу?
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onHandleDelete}
                    disabled={busy}
                    className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {busy ? "Удаление..." : "Удалить"}
                  </button>
                  <button
                    onClick={() => onConfirmDeleteChange(false)}
                    disabled={busy}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer"
                    title="Отмена"
                  >
                    <X size={15} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="delete-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                onClick={() => onConfirmDeleteChange(true)}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 border border-rose-200/70 dark:border-rose-900/40 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              >
                <Trash2 size={15} />
                Удалить
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </If>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer active:scale-95"
        >
          Закрыть
        </button>
        <If is={Boolean(onEdit)}>
          <button
            onClick={() => onEdit?.(task)}
            disabled={busy || task.rawId == null}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <Pencil size={15} />
            Редактировать
          </button>
        </If>
      </div>
    </div>
  );
}
