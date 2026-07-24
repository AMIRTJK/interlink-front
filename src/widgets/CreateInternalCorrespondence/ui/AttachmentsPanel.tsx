import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, X, Eye, Download, FileText, AlertCircle } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { AttachedFile } from "../types";

interface IProps {
  isOpen: boolean;
  hideTab?: boolean;
  openLeft?: boolean;
  onOpen: () => void;
  onClose: () => void;
  attachments: AttachedFile[];
  onPreview: (file: AttachedFile) => void;
  onDownload: (file: AttachedFile) => void;
  onUpload?: () => void;
  onRemove?: (file: AttachedFile) => void;
  isReadOnly?: boolean;
}

export const AttachmentsPanel: React.FC<IProps> = ({
  isOpen,
  hideTab,
  openLeft = true,
  onOpen,
  onClose,
  attachments,
  onPreview,
  onDownload,
  onUpload,
  onRemove,
  isReadOnly,
}) => {
  return (
    <>
      <If is={!hideTab}>
        <div
          className="absolute z-20"
          style={openLeft ? { left: -36, top: 370 } : { right: -36, top: 370 }}
        >
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            className={cn(
              "bg-white border border-slate-200 shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              openLeft ? "border-r-0 rounded-l-xl" : "border-l-0 rounded-r-xl",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
            )}
            aria-label="Вложения"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500" />
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "0.08em",
              }}
            >
              Вложения
            </span>
            <If is={attachments.length > 0}>
              <span className="bg-indigo-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                {attachments.length}
              </span>
            </If>
          </motion.button>
        </div>
      </If>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: openLeft ? 12 : -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: openLeft ? 12 : -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[500] flex flex-col"
            style={{
              ...(openLeft
                ? { right: "calc(100% + 12px)" }
                : { left: "calc(100% + 12px)" }),
              maxHeight: "var(--icc-panel-max-h, 70vh)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Вложения
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {attachments.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Закрыть панель вложений"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Файлы документа
              </span>
              <If is={!isReadOnly && !!onUpload}>
                <button
                  type="button"
                  onClick={onUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Paperclip size={13} />
                  <span>Загрузить файл</span>
                </button>
              </If>
            </div>

            <If is={!isReadOnly}>
              <div className="mx-4 mt-3 p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-snug">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Внимание:</strong> Не забудьте нажать кнопку <strong>«Сохранить»</strong> в верхней панели документа, чтобы вложения сохранились!
                </span>
              </div>
            </If>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 min-h-0">
              <If is={attachments.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Paperclip size={15} />
                  <span>Нет прикреплённых файлов</span>
                </div>
              </If>
              <If is={attachments.length > 0}>
                {attachments.map((file, idx) => (
                  <div
                    key={file.id}
                    onClick={() => onPreview(file)}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 cursor-pointer hover:bg-slate-100/70 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform">
                        <FileText size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <If is={!!file.file}>
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-md flex-shrink-0">
                              Новое
                            </span>
                          </If>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {[file.type, file.size].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(file);
                        }}
                        title="Просмотр"
                        className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                      <If is={!!file.url}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(file);
                          }}
                          title="Скачать"
                          className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <Download size={13} />
                        </button>
                      </If>
                      <If is={!isReadOnly && !!onRemove}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.(file);
                          }}
                          title="Удалить файл"
                          className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </If>
                    </div>
                  </div>
                ))}
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

