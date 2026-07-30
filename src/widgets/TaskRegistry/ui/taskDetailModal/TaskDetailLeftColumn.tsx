import * as React from "react";
import { motion } from "framer-motion";
import { FileIcon, Download, Paperclip, Trash2, Upload } from "lucide-react";
import { If } from "@shared/ui";
import type { Task } from "../../model/types";

interface IProps {
  task: Task;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadAttachments?: (taskId: number, files: File[]) => Promise<void> | void;
  onDownloadAttachment?: (
    taskId: number,
    attachmentId: number,
    fileName: string,
  ) => Promise<void> | void;
  onDeleteAttachment?: (
    taskId: number,
    attachmentId: number,
  ) => Promise<void> | void;
}

export function TaskDetailLeftColumn({
  task,
  uploading,
  fileInputRef,
  onUpload,
  onUploadAttachments,
  onDownloadAttachment,
  onDeleteAttachment,
}: IProps) {
  return (
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Вложения
          </h3>
          <If is={Boolean(onUploadAttachments) && task.rawId != null}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-60"
            >
              <Upload size={13} />
              {uploading ? "Загрузка..." : "Загрузить"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={onUpload}
            />
          </If>
        </div>
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
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (task.rawId != null && file.rawId != null) {
                        onDownloadAttachment?.(task.rawId, file.rawId, file.name);
                      }
                    }}
                    disabled={task.rawId == null || file.rawId == null}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-emerald-600 disabled:opacity-40"
                    title="Скачать"
                  >
                    <Download size={16} />
                  </button>
                  <If is={Boolean(onDeleteAttachment)}>
                    <button
                      onClick={() => {
                        if (task.rawId != null && file.rawId != null) {
                          onDeleteAttachment?.(task.rawId, file.rawId);
                        }
                      }}
                      disabled={task.rawId == null || file.rawId == null}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-slate-400 hover:text-rose-600 disabled:opacity-40"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </If>
                </div>
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
  );
}
