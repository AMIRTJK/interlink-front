import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Tag } from "lucide-react";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn } from "@shared/lib";
import type {
  Attachment,
  Colleague,
  Priority,
  Task,
  TaskStatus,
} from "../../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../model/constants";
import { Avatar } from "../Avatar";
import { TaskAttachmentsDropzone } from "./TaskAttachmentsDropzone";

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
  onRemoveAttachment: (id: string) => void;
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
  onSave?: () => void;
  isSaving?: boolean;
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
  formAssignees,
  onToggleAssignee,
  assigneeQuery,
  onAssigneeQueryChange,
  assigneeOpen,
  onAssigneeOpenChange,
  colleagues,
  onSave,
  isSaving,
}: IProps) {
  const filteredColleagues = colleagues.filter(
    (c) =>
      !formAssignees.includes(c.id) &&
      c.name.toLowerCase().includes(assigneeQuery.toLowerCase()),
  );

  return (
    <motion.div
      key="personal-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-6 pb-28"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left container */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5">
          {/* TASK TITLE */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              НАЗВАНИЕ ЗАДАЧИ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => {
                onFormTitleChange(e.target.value);
                if (e.target.value.trim()) onClearTitleError();
              }}
              className={cn(
                "w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none transition-all text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 shadow-[0_4px_16px_rgba(100,105,240,0.06)]",
                titleError
                  ? "border-red-500 ring-1 ring-red-200"
                  : "",
              )}
              placeholder="Напр: Оптимизация процесса деплоя"
            />
            {titleError && (
              <p className="text-[10px] font-bold text-red-500">
                Название обязательно
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              ОПИСАНИЕ
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => onFormDescriptionChange(e.target.value)}
              className="w-full h-36 px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none transition-all text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] resize-none focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
              placeholder="Подробно опишите задачу..."
            />
          </div>

          {/* ATTACHMENTS DROPZONE */}
          <TaskAttachmentsDropzone
            attachments={attachments}
            onRemoveAttachment={onRemoveAttachment}
            newFiles={newFiles}
            onRemoveNewFile={onRemoveNewFile}
            onAddNewFiles={onAddNewFiles}
            fileInputRef={fileInputRef}
            editTask={editTask}
            onDownloadAttachment={onDownloadAttachment}
            onDeleteAttachment={onDeleteAttachment}
          />
        </div>

        {/* Right container */}
        <div className="lg:col-span-1 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-4">
          {/* PRIORITY */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              ПРИОРИТЕТ
            </label>
            <select
              value={formPriority}
              onChange={(e) => onFormPriorityChange(e.target.value as Priority)}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 cursor-pointer shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              СТАТУС
            </label>
            <select
              value={formStatus}
              onChange={(e) => onFormStatusChange(e.target.value as TaskStatus)}
              className="w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 cursor-pointer shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* DUE DATE */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              СРОК ВЫПОЛНЕНИЯ
            </label>
            <ConfigProvider
              theme={{
                token: {
                  borderRadius: 16,
                  controlHeight: 46,
                  fontSize: 12,
                  colorPrimary: "#3373e5",
                  colorBgContainer: "transparent",
                },
                components: {
                  DatePicker: {
                    cellWidth: 24,
                    cellHeight: 18,
                    cellFontSize: 10,
                    headerMarginBottom: 0,
                  },
                },
              }}
            >
              <DatePicker
                value={formDueDate ? dayjs(formDueDate) : null}
                onChange={(d) => onFormDueDateChange(d ? d.format("YYYY-MM-DD") : "")}
                format="DD.MM.YYYY"
                placeholder="Выберите срок"
                allowClear
                placement="bottomLeft"
                getPopupContainer={(trigger) => (trigger.parentElement as HTMLElement) || document.body}
                className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 border border-white/90 dark:border-white/10 rounded-2xl text-xs font-semibold text-[#1e2548] dark:text-slate-100 shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
              />
            </ConfigProvider>
          </div>

          {/* TAGS */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              ТЕГИ
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none" />
              <input
                type="text"
                value={formTags}
                onChange={(e) => onFormTagsChange(e.target.value)}
                placeholder="frontend, дизайн, срочно"
                className="w-full pl-10 pr-4 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)] focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 transition-all"
              />
            </div>
            {formTags.trim() && (
              <div className="flex flex-wrap gap-1 mt-1">
                {formTags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* ASSIGNEES */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              ИСПОЛНИТЕЛИ
            </label>

            {formAssignees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formAssignees.map((id) => {
                  const col = colleagues.find((c) => c.id === id);
                  if (!col) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-[#3373e5]/20 dark:border-white/10 rounded-full shadow-2xs text-xs font-bold text-[#1e2548] dark:text-slate-100"
                    >
                      <Avatar colleague={col} className="w-5 h-5 text-[8px]" allowPreview={false} />
                      <span>{col.name.split(" ")[0]}</span>
                      <button
                        type="button"
                        onClick={() => onToggleAssignee(id)}
                        className="text-[#9aa2c8] hover:text-rose-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={assigneeQuery}
                onChange={(e) => {
                  onAssigneeQueryChange(e.target.value);
                  onAssigneeOpenChange(true);
                }}
                onFocus={() => onAssigneeOpenChange(true)}
                onBlur={() => setTimeout(() => onAssigneeOpenChange(false), 150)}
                className="w-full pl-5 pr-10 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
                placeholder="Поиск коллеги..."
              />
              <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none" />
            </div>

            <AnimatePresence>
              {assigneeOpen && filteredColleagues.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-50 left-0 right-0 mt-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
                >
                  {filteredColleagues.map((col) => (
                    <button
                      key={col.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onToggleAssignee(col.id);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-indigo-50/70 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
                    >
                      <Avatar colleague={col} className="w-7 h-7 text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {col.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {col.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Action Button matching screenshot */}
      <div className="flex items-center justify-start pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-7 py-3 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-[0_8px_25px_rgba(16,185,129,0.35)] dark:shadow-none transition-all cursor-pointer active:scale-95"
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </motion.div>
  );
}
