import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, File, Download, Clock, Paperclip, SquarePen } from "lucide-react";
import { If } from "@shared/ui/If";
import type { IPersonalTask } from "../model/types";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../lib/helpers";

interface IProps {
  onClose: () => void;
  task: IPersonalTask | null;
  userName: string;
  onEditClick: () => void;
  activeTheme: any;
}

const PRIORITY_BADGES = {
  critical: { bg: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400", dot: "bg-red-500", label: "Критичный" },
  high: { bg: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400", dot: "bg-orange-500", label: "Высокий" },
  medium: { bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400", dot: "bg-amber-500", label: "Средний" },
  low: { bg: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400", dot: "bg-green-500", label: "Низкий" },
};

const STATUS_BADGES = {
  new: { bg: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400", dot: "bg-blue-500", label: "Новая" },
  in_progress: { bg: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500", label: "В работе" },
  review: { bg: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400", dot: "bg-purple-500", label: "На ревью" },
  completed: { bg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Завершена" },
  overdue: { bg: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400", dot: "bg-rose-500", label: "Просрочена" },
};

export const TaskDetailsModal = ({ onClose, task, userName, onEditClick, activeTheme }: IProps) => {
  if (!task) return null;
  const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
  const sBadge = STATUS_BADGES[task.status] || STATUS_BADGES.new;
  const countMeta = getCountdown(task.due_date);
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };
  const mockAttachments = [
    { name: "Техническое_задание.pdf", size: "2.4 МБ" },
    { name: "Макет_интерфейса.png", size: "845 КБ" },
    { name: "Спецификация_API.docx", size: "128 КБ" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col z-10"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-700 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500">TSK-{task.id}</span>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight mt-0.5 m-0">{task.title}</h3>
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pBadge.dot}`} /> {pBadge.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sBadge.dot}`} /> {sBadge.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex-shrink-0 border-0 bg-transparent cursor-pointer flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[64vh] overflow-y-auto bg-white dark:bg-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 m-0">Описание</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed m-0 whitespace-pre-wrap">{task.description || "Описание отсутствует."}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 m-0">Теги</h4>
                <div className="flex flex-wrap gap-1.5">
                  <If is={task.tags && task.tags.length > 0}>
                    {task.tags?.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        #{tag}
                      </span>
                    ))}
                  </If>
                  <If is={!task.tags || task.tags.length === 0}>
                    <span className="text-xs text-slate-400 font-medium">Нет тегов</span>
                  </If>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 m-0">Прогресс</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 w-10 text-right">{task.progress}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 m-0">Исполнитель</h4>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 bg-zinc-500">{getInitials(userName)}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{userName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 m-0">Срок</h4>
                  <span className={`text-sm font-semibold ${countMeta.type === "overdue" ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-200"}`}>{formatDueDate(task.due_date)}</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 m-0">Приоритет</h4>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{pBadge.label}</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 m-0">Создана</h4>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{formatDueDate(task.created_at)}</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 m-0">Время до срока</h4>
                  <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums font-mono ${countMeta.type === "overdue" ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-200"}`}>
                    <Clock size={13} className={countMeta.type === "overdue" ? "text-rose-500 animate-pulse" : ""} /> {countMeta.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-700">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 m-0">
              <Paperclip size={13} /> Вложения
            </h4>
            <div className="space-y-2">
              {mockAttachments.map((file) => (
                <div key={file.name} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
                  <span className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-500 dark:text-zinc-300">
                    <File size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{file.name}</div>
                    <div className="text-xs text-zinc-400">{file.size}</div>
                  </div>
                  <button className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex-shrink-0 border-0 bg-transparent cursor-pointer flex items-center justify-center">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3 bg-white dark:bg-zinc-800">
          <button onClick={onClose} className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-0 bg-transparent cursor-pointer">
            Закрыть
          </button>
          <button onClick={onEditClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r ${activeTheme.gradient} hover:opacity-90 transition-all shadow-md border-0 cursor-pointer`}>
            <SquarePen size={16} /> Редактировать
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};
