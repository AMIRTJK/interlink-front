import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, FileIcon, Download, Paperclip, Calendar, Trash2 } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Task, TaskStatus } from "../model/types";
import { STATUS_OPTIONS } from "../model/constants";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../lib/helpers";
import { Avatar } from "./Avatar";
import { CountdownTimer } from "./Countdown";

const ModalContainer = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col"
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  );
};

export const TaskDetailModal = ({
  task,
  onClose,
  onDelete,
  onStatusChange,
  onDownloadAttachment,
}: {
  task: Task;
  onClose: () => void;
  onDelete?: (task: Task) => Promise<void> | void;
  onStatusChange?: (task: Task, status: TaskStatus) => Promise<void> | void;
  onDownloadAttachment?: (
    taskId: number,
    attachmentId: number,
    fileName: string,
  ) => Promise<void> | void;
}) => {
  const pMeta = getPriorityMeta(task.priority);
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleStatus = async (status: TaskStatus) => {
    if (!onStatusChange || status === task.status) return;
    setBusy(true);
    try {
      await onStatusChange(task, status);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete(task);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
            {task.id}
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {task.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-y-auto">
        {/* Left Column */}
        <div className="flex-1 p-8 space-y-8 border-r border-slate-100 dark:border-white/10">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Описание
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
              {task.description}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Теги
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full border border-slate-200 dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Прогресс
              </h3>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {task.progress}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Вложения
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {task.attachments.length > 0 ? (
                task.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-300 transition-colors"
                  >
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
                      <FileIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{file.size}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (task.rawId != null && file.rawId != null) {
                          onDownloadAttachment?.(task.rawId, file.rawId, file.name);
                        }
                      }}
                      disabled={task.rawId == null || file.rawId == null}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-emerald-600 disabled:opacity-0"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 dark:border-white/10 rounded-2xl">
                  <Paperclip className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-sm text-slate-400 font-medium">
                    Нет прикрепленных файлов
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="w-80 p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Исполнитель
              </label>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <Avatar colleague={task.assignee} className="w-10 h-10 text-xs" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {task.assignee.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {task.assignee.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Приоритет
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                  <div className={cn("w-2 h-2 rounded-full", pMeta.color)} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {pMeta.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Статус
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      getStatusMeta(task.status).color,
                    )}
                  />
                  <select
                    value={task.status}
                    disabled={busy || !onStatusChange}
                    onChange={(e) => handleStatus(e.target.value as TaskStatus)}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer disabled:cursor-default"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Срок
              </label>
              <div className="flex flex-col gap-1 px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Calendar size={14} />
                  <span className="text-xs font-bold">
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
                <If is={task.status !== "completed" && getCountdown(task.dueDate).type !== "overdue"}>
                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/10">
                    <CountdownTimer dueDate={task.dueDate} />
                  </div>
                </If>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Создано
              </label>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {formatDueDate(task.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-white/10 flex justify-between gap-3">
        <If is={Boolean(onDelete)}>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Удалить задачу?
              </span>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-60"
              >
                Да, удалить
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busy}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-60"
            >
              <Trash2 size={16} />
              Удалить
            </button>
          )}
        </If>
        <button
          onClick={onClose}
          className="ml-auto px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          Закрыть
        </button>
      </div>
    </ModalContainer>
  );
};
