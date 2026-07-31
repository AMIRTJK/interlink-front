import type { ChangeEvent, RefObject } from "react";
import { Eye, Paperclip, X } from "lucide-react";

import { If } from "@shared/ui";

import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE_MB,
} from "../../../lib/constants";
import type { AttachedFile } from "../../../types";
import { FileTextIcon } from "../FileTextIcon";

interface IProps {
  attachments: AttachedFile[];
  onPreview: (file: AttachedFile) => void;
  onRemove: (file: AttachedFile) => void;
  isReadOnly: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const AttachmentsField = ({
  attachments,
  onPreview,
  onRemove,
  isReadOnly,
  fileInputRef,
  onFileChange,
}: IProps) => (
  <div className="px-6 py-4 border-b border-slate-100">
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 pt-1.5 w-24 flex-shrink-0">
        <label className="text-sm font-semibold text-slate-500">
          Вложения
        </label>
        <If is={attachments.length > 0}>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            {attachments.length}
          </span>
        </If>
      </div>
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
        {attachments
          .filter((a) => a.file)
          .map((file) => (
            <div
              key={file.id}
              onClick={() => onPreview(file)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-xs cursor-pointer transition-all group"
            >
              <FileTextIcon className="w-4 h-4 text-amber-500 flex-shrink-0 group-hover:scale-105 transition-transform" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate max-w-[140px] group-hover:text-blue-600 transition-colors">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {file.size} · не сохранён
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(file);
                }}
                title="Просмотр вложения"
                className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0 cursor-pointer"
              >
                <Eye size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file);
                }}
                title="Убрать файл"
                className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isReadOnly || attachments.length >= MAX_ATTACHMENTS}
          title={`${ATTACHMENT_EXTENSIONS.join(", ")} · до ${MAX_ATTACHMENTS} файлов · до ${MAX_ATTACHMENT_SIZE_MB} МБ каждый`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50 cursor-pointer"
        >
          <Paperclip size={12} />
          <span>Прикрепить файл</span>
          {attachments.some((a) => a.file) && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
              {attachments.filter((a) => a.file).length}
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ATTACHMENT_ACCEPT}
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  </div>
);
