import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Tag, Check } from "lucide-react";
import { DatePicker, Select, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { cn } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import type {
  Attachment,
  Colleague,
  Priority,
  Task,
  TaskStatus,
} from "../../model/types";
import { PRIORITY_OPTIONS, FORM_STATUS_OPTIONS } from "../../model/constants";
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
  const assigneeDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!assigneeOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        assigneeDropdownRef.current?.contains(target) ||
        target?.closest("[data-avatar-preview-portal]")
      ) {
        return;
      }
      onAssigneeOpenChange(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [assigneeOpen, onAssigneeOpenChange]);

  const filteredColleagues = React.useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    const result: Colleague[] = [];
    for (let i = 0; i < colleagues.length; i++) {
      const c = colleagues[i];
      if (!q || c.name.toLowerCase().includes(q) || (c.role && c.role.toLowerCase().includes(q))) {
        result.push(c);
        if (result.length >= 30) break;
      }
    }
    return result;
  }, [colleagues, assigneeQuery]);

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
                "w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none transition-colors text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 shadow-[0_4px_16px_rgba(100,105,240,0.06)]",
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
              className="w-full h-36 px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none transition-colors text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] resize-none focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
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
                  headerMarginBottom: 0,
                },
              },
            }}
          >
            {/* PRIORITY */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
                ПРИОРИТЕТ
              </label>
              <Select
                value={formPriority}
                onChange={(val) => onFormPriorityChange(val as Priority)}
                options={PRIORITY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: (
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dotBg)} />
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                  ),
                }))}
                className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 border border-white/90 dark:border-white/10 rounded-2xl text-xs font-semibold text-[#1e2548] dark:text-slate-100 shadow-[0_4px_16px_rgba(100,105,240,0.06)] [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:bg-transparent! [&_.ant-select-selection-item]:text-[#1e2548]! dark:[&_.ant-select-selection-item]:text-slate-100!"
              />
            </div>

            {/* STATUS */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
                СТАТУС
              </label>
              <Select
                value={formStatus}
                onChange={(val) => onFormStatusChange(val as TaskStatus)}
                options={FORM_STATUS_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: (
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dotBg)} />
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                  ),
                }))}
                className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 border border-white/90 dark:border-white/10 rounded-2xl text-xs font-semibold text-[#1e2548] dark:text-slate-100 shadow-[0_4px_16px_rgba(100,105,240,0.06)] [&_.ant-select-selector]:border-none! [&_.ant-select-selector]:bg-transparent! [&_.ant-select-selection-item]:text-[#1e2548]! dark:[&_.ant-select-selection-item]:text-slate-100!"
              />
            </div>

            {/* DUE DATE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
                СРОК ВЫПОЛНЕНИЯ
              </label>
              <DatePicker
                value={formDueDate ? dayjs(formDueDate) : null}
                onChange={(d) => onFormDueDateChange(d ? d.format("YYYY-MM-DD") : "")}
                format="DD.MM.YYYY"
                placeholder="Выберите срок"
                allowClear
                placement="bottomLeft"
                className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 border border-white/90 dark:border-white/10 rounded-2xl text-xs font-semibold text-[#1e2548] dark:text-slate-100 shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
              />
            </div>
          </ConfigProvider>

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
                className="w-full pl-10 pr-10 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)] focus:bg-white focus:border-[#3373e5]/40 focus:ring-2 focus:ring-[#3373e5]/15 transition-colors"
              />
              {formTags ? (
                <button
                  type="button"
                  onClick={() => onFormTagsChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                  title="Очистить"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            <div className="h-6 flex items-center">
              {formTags.trim() ? (() => {
                const tagsList = formTags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                const MAX_VISIBLE_TAGS = 4;
                const visibleTags = tagsList.slice(0, MAX_VISIBLE_TAGS);
                const hiddenTags = tagsList.slice(MAX_VISIBLE_TAGS);

                return (
                  <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                    {visibleTags.map((tag, idx) => (
                      <Tooltip key={idx} title={`#${tag}`} placement="top">
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 truncate max-w-[85px] shrink-0 cursor-default"
                        >
                          #{tag}
                        </span>
                      </Tooltip>
                    ))}
                    {hiddenTags.length > 0 && (
                      <Tooltip
                        title={
                          <div className="flex flex-wrap gap-1 p-1.5 max-w-xs max-h-40 overflow-y-auto">
                            {hiddenTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        }
                      >
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/80 dark:hover:bg-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700 cursor-pointer shrink-0 transition-colors shadow-2xs">
                          +{hiddenTags.length}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );
              })() : null}
            </div>
          </div>

          {/* ASSIGNEES */}
          <div ref={assigneeDropdownRef} className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
              ИСПОЛНИТЕЛИ
            </label>

            <div className="relative">
              <input
                type="text"
                value={assigneeQuery}
                onChange={(e) => {
                  onAssigneeQueryChange(e.target.value);
                  onAssigneeOpenChange(true);
                }}
                onFocus={() => onAssigneeOpenChange(true)}
                onClick={() => onAssigneeOpenChange(true)}
                className="w-full pl-5 pr-10 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
                placeholder="Поиск коллеги..."
              />
              {assigneeQuery ? (
                <button
                  type="button"
                  onClick={() => onAssigneeQueryChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                  title="Очистить"
                >
                  <X size={14} />
                </button>
              ) : (
                <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none" />
              )}

              <AnimatePresence>
                {assigneeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {filteredColleagues.length > 0 ? (
                      filteredColleagues.map((col) => {
                        const isSelected = formAssignees.includes(col.id);
                        return (
                          <div
                            key={col.id}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-3.5 py-2 transition-colors text-left cursor-pointer select-none",
                              isSelected
                                ? "bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50"
                                : "hover:bg-indigo-50/70 dark:hover:bg-slate-700/60",
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Avatar colleague={col} className="w-7 h-7 text-[10px]" />
                              </div>
                              <Tooltip
                                title={
                                  <div className="p-0.5 max-w-xs">
                                    <p className="font-bold text-xs text-white">{col.name}</p>
                                    {col.role && (
                                      <p className="text-[10px] text-slate-300 mt-0.5 font-normal">
                                        {col.role}
                                      </p>
                                    )}
                                  </div>
                                }
                                placement="right"
                              >
                                <div
                                  className="min-w-0 flex-1 cursor-pointer"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    onToggleAssignee(col.id);
                                  }}
                                >
                                  <p
                                    className={cn(
                                      "text-xs font-bold truncate",
                                      isSelected
                                        ? "text-blue-700 dark:text-blue-300"
                                        : "text-slate-800 dark:text-slate-100",
                                    )}
                                  >
                                    {col.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {col.role}
                                  </p>
                                </div>
                              </Tooltip>
                            </div>

                            {/* Checkbox indicator */}
                            <div
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onToggleAssignee(col.id);
                              }}
                              className={cn(
                                "w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all shrink-0 border cursor-pointer",
                                isSelected
                                  ? "bg-[#3373e5] border-[#3373e5] text-white shadow-2xs"
                                  : "border-slate-300 dark:border-white/20 bg-white/80 dark:bg-slate-800 hover:border-[#3373e5]/50",
                              )}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-5 px-4 text-center">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Не найдено
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          По вашему запросу сотрудники не найдены
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="min-h-[28px] flex items-center">
              {formAssignees.length > 0 ? (() => {
                const MAX_VISIBLE_ASSIGNEES = 2;
                const visibleAssignees = formAssignees.slice(0, MAX_VISIBLE_ASSIGNEES);
                const hiddenAssignees = formAssignees.slice(MAX_VISIBLE_ASSIGNEES);

                return (
                  <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
                    {visibleAssignees.map((id) => {
                      const col = colleagues.find((c) => c.id === id);
                      if (!col) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-[#3373e5]/20 dark:border-white/10 rounded-full shadow-2xs text-xs font-bold text-[#1e2548] dark:text-slate-100 shrink-0"
                        >
                          <Avatar colleague={col} className="w-5 h-5 text-[8px]" />
                          <Tooltip
                            title={
                              <div className="p-0.5 max-w-xs">
                                <p className="font-bold text-xs text-white">{col.name}</p>
                                {col.role && (
                                  <p className="text-[10px] text-slate-300 mt-0.5 font-normal">
                                    {col.role}
                                  </p>
                                )}
                              </div>
                            }
                            placement="top"
                          >
                            <span className="truncate max-w-[85px] cursor-default">
                              {col.name.split(" ")[0]}
                            </span>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => onToggleAssignee(id)}
                            className="text-[#9aa2c8] hover:text-rose-500 transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                    {hiddenAssignees.length > 0 && (
                      <Tooltip
                        title={
                          <div className="flex flex-col gap-1.5 p-1.5 max-w-xs max-h-48 overflow-y-auto">
                            {hiddenAssignees.map((id) => {
                              const col = colleagues.find((c) => c.id === id);
                              if (!col) return null;
                              return (
                                <div
                                  key={id}
                                  className="flex items-center justify-between gap-3 text-xs p-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Avatar colleague={col} className="w-5 h-5 text-[8px]" />
                                    <span className="truncate font-medium text-white">{col.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onToggleAssignee(id)}
                                    className="text-slate-400 hover:text-rose-400 cursor-pointer ml-2 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        }
                      >
                        <span className="px-2.5 py-1 text-xs font-black rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/80 dark:hover:bg-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700 cursor-pointer shrink-0 transition-colors shadow-2xs">
                          +{hiddenAssignees.length}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );
              })() : null}
            </div>
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
