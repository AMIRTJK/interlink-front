import * as React from "react";
import { Upload, Download, Trash2, X, FileIcon } from "lucide-react";
import type { Attachment, Task } from "../../model/types";
import { If } from "@shared/ui";

interface TaskAttachmentsDropzoneProps {
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
}

export function TaskAttachmentsDropzone({
  attachments,
  onRemoveAttachment,
  newFiles,
  onRemoveNewFile,
  onAddNewFiles,
  fileInputRef,
  editTask,
  onDownloadAttachment,
  onDeleteAttachment,
}: TaskAttachmentsDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) {
      onAddNewFiles(files);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-wider text-[#7e85b0] dark:text-purple-300/60 block">
        ВЛОЖЕНИЯ
      </label>

      {/* Drag & Drop dashed box matching screenshot */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
          isDragOver
            ? "border-[#10b981] bg-[#f0fdf4]"
            : "border-[#d8defa] dark:border-white/10 bg-[#f4f6fe]/60 dark:bg-slate-900/50"
        }`}
      >
        <p className="text-xs font-medium text-[#9aa2c8] dark:text-slate-400">
          Перетащите файлы сюда или
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ebedfa] hover:bg-[#e2e6f8] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#d2d8f8] dark:border-white/10 text-[#10b981] dark:text-emerald-400 font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-2xs"
        >
          <Upload size={13} />
          <span>Выбрать файлы</span>
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

      {/* Attached & Queued Files List */}
      <If is={attachments.length > 0 || newFiles.length > 0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="group flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl hover:border-emerald-300 transition-colors"
            >
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <FileIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400">{file.size}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => {
                    if (editTask?.rawId != null && file.rawId != null) {
                      onDownloadAttachment?.(
                        editTask.rawId,
                        file.rawId,
                        file.name,
                      );
                    }
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
                >
                  <Download size={15} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (editTask?.rawId != null && file.rawId != null) {
                      await onDeleteAttachment?.(
                        editTask.rawId,
                        file.rawId,
                      );
                      onRemoveAttachment(file.id);
                    }
                  }}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {newFiles.map((file, index) => (
            <div
              key={`new-${index}-${file.name}`}
              className="group flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-xl hover:border-emerald-300 transition-colors"
            >
              <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                <FileIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                  Очередь
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveNewFile(index)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </If>
    </div>
  );
}
