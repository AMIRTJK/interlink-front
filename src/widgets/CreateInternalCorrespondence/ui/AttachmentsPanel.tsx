import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, X, Eye, Download, FileText } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { AttachedFile } from "../types";

interface IProps {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  attachments: AttachedFile[];
  onPreview: (file: AttachedFile) => void;
  onDownload: (file: AttachedFile) => void;
}

export const AttachmentsPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  attachments,
  onPreview,
  onDownload,
}: IProps) => {
  return (
    <>
      {!hideTab && (
        <div className="absolute z-20" style={{ left: -36, top: 370 }}>
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            className={cn(
              "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50"
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
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{
              right: "calc(100% + 12px)",
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
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Закрыть панель вложений"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">
                Сохранённые файлы
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 min-h-0">
              <If is={attachments.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Paperclip size={15} />
                  <span>Нет сохранённых вложений</span>
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
                        <p
                          className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors"
                          title={file.name}
                        >
                          {file.name}
                        </p>
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
