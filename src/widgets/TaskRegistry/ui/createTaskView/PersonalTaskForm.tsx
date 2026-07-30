import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Download,
  Trash2,
  Paperclip,
  FileIcon,
} from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type {
  Attachment,
  Colleague,
  Priority,
  Task,
  TaskStatus,
} from "../../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../model/constants";
import { Avatar } from "../Avatar";

interface IProps {
  formTitle: string;
  onFormTitleChange: (val: string) => void;
  titleError: boolean;
  onClearTitleError: () => void;
  formDescription: string;
  onFormDescriptionChange: (val: string) => void;
  formTags: string;
  onFormTagsChange: (val: string) => void;
  attachments: Attachment[];
  onRemoveAttachment: (id: number) => void;
  newFiles: File[];
  onRemoveNewFile: (index: number) => void;
  onAddNewFiles: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  editTask?: Task | null;
  onDownloadAttachment?: (
    taskId: number,
    attachmentId: number,
    fileName: string,
  ) => Promise<void> | void;
  onDeleteAttachment?: (
    taskId: number,
    attachmentId: number,
  ) => Promise<void> | void;
  formPriority: Priority;
  onFormPriorityChange: (val: Priority) => void;
  formStatus: TaskStatus;
  onFormStatusChange: (val: TaskStatus) => void;
  formDueDate: string;
  onFormDueDateChange: (val: string) => void;
  formProgress: number;
  onFormProgressChange: (val: number) => void;
  formAssignees: string[];
  onToggleAssignee: (id: string) => void;
  assigneeQuery: string;
  onAssigneeQueryChange: (val: string) => void;
  assigneeOpen: boolean;
  onAssigneeOpenChange: (open: boolean) => void;
  colleagues: Colleague[];
}

export function PersonalTaskForm({
  formTitle,
  onFormTitleChange,
  titleError,
  onClearTitleError,
  formDescription,
  onFormDescriptionChange,
  formTags,
  onFormTagsChange,
  attachments,
  onRemoveAttachment,
  newFiles,
  onRemoveNewFile,
  onAddNewFiles,
  fileInputRef,
  editTask,
  onDownloadAttachment,
  onDeleteAttachment,
  formPriority,
  onFormPriorityChange,
  formStatus,
  onFormStatusChange,
  formDueDate,
  onFormDueDateChange,
  formProgress,
  onFormProgressChange,
  formAssignees,
  onToggleAssignee,
  assigneeQuery,
  onAssigneeQueryChange,
  assigneeOpen,
  onAssigneeOpenChange,
  colleagues,
}: IProps) {
  const filteredColleagues = colleagues.filter(
    (c) =>
      !formAssignees.includes(c.id) &&
      c.name.toLowerCase().includes(assigneeQuery.toLowerCase()),
  );

  return (
    <motion.div
      key="personal-form"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left two columns */}
      <div className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Название задачи <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => {
              onFormTitleChange(e.target.value);
              if (e.target.value.trim()) onClearTitleError();
            }}
            className={cn(
              "w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100",
              titleError
                ? "border-red-500 ring-1 ring-red-200"
                : "border-white/30 dark:border-white/10",
            )}
            placeholder="Напр: Оптимизация процесса деплоя"
          />
          {titleError && (
            <p className="text-[10px] font-bold text-red-500 uppercase">
              Название обязательно
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Описание
          </label>
          <textarea
            value={formDescription}
            onChange={(e) => onFormDescriptionChange(e.target.value)}
            className="w-full h-40 px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100 resize-none"
            placeholder="Подробно опишите задачу..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Теги (через запятую)
          </label>
          <input
            type="text"
            value={formTags}
            onChange={(e) => onFormTagsChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100"
            placeholder="Backend, API, High Priority"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-t border-white/20 dark:border-white/10 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Вложения
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            >
              <Upload size={13} />
              Выбрать файлы
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                e.target.value = "";
                if (files.length) {
                  onAddNewFiles(files);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <If is={attachments.length > 0 || newFiles.length > 0}>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-300 transition-colors"
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
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        if (editTask?.rawId != null && file.rawId != null) {
                          onDownloadAttachment?.(editTask.rawId, file.rawId, file.name);
                        }
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (editTask?.rawId != null && file.rawId != null) {
                          await onDeleteAttachment?.(editTask.rawId, file.rawId);
                          onRemoveAttachment(file.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {newFiles.map((file, index) => (
                <div
                  key={`new-${index}-${file.name}`}
                  className="group flex items-center gap-3 p-3 bg-white/40 dark:bg-slate-850/40 border border-white/20 dark:border-white/5 rounded-xl hover:border-emerald-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                    <FileIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded mr-1">
                      Очередь
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveNewFile(index)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </If>

            <If is={attachments.length === 0 && newFiles.length === 0}>
              <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 dark:border-white/10 rounded-2xl">
                <Paperclip className="mx-auto text-slate-300 mb-2" size={24} />
                <p className="text-sm text-slate-400 font-medium">
                  Нет прикрепленных файлов
                </p>
              </div>
            </If>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Приоритет
          </label>
          <select
            value={formPriority}
            onChange={(e) => onFormPriorityChange(e.target.value as Priority)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Статус
          </label>
          <select
            value={formStatus}
            onChange={(e) => onFormStatusChange(e.target.value as TaskStatus)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Срок выполнения
          </label>
          <input
            type="date"
            value={formDueDate}
            onChange={(e) => onFormDueDateChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Прогресс
            </label>
            <span className="text-xs font-bold text-emerald-600">
              {formProgress}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={formProgress}
            onChange={(e) => onFormProgressChange(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Исполнители
          </label>
          {formAssignees.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formAssignees.map((id) => {
                const col = colleagues.find((c) => c.id === id)!;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-sm"
                  >
                    <Avatar colleague={col} className="w-6 h-6 text-[9px]" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {col.name.split(" ")[0]}
                    </span>
                    <button
                      onClick={() => onToggleAssignee(id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <input
            type="text"
            value={assigneeQuery}
            onChange={(e) => {
              onAssigneeQueryChange(e.target.value);
              onAssigneeOpenChange(true);
            }}
            onFocus={() => onAssigneeOpenChange(true)}
            onBlur={() => setTimeout(() => onAssigneeOpenChange(false), 150)}
            className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100"
            placeholder="Поиск коллеги..."
          />
          <AnimatePresence>
            {assigneeOpen && filteredColleagues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
              >
                {filteredColleagues.map((col) => (
                  <button
                    key={col.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onToggleAssignee(col.id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <Avatar colleague={col} className="w-8 h-8 text-[10px]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {col.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{col.role}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
