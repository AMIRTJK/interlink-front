import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, X, Eye, Download, FileText } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { _axios } from "@shared/api";
import { getEnvVar } from "@shared/config";

interface IAttachment {
  id: number;
  original_name: string;
  mime: string;
  size: number;
  download_url: string;
  preview_url: string;
}

interface IProps {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  attachments: IAttachment[];
}

const formatSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const toAbsoluteUrl = (url: string): string => {
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const apiHost = (getEnvVar("VITE_API_URL") || "").replace(/\/+$/, "");
  return `${apiHost}/${url.replace(/^\/+/, "")}`;
};

const getMimeIcon = (mime: string) => {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("image")) return "IMG";
  if (mime.includes("word") || mime.includes("document")) return "DOC";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "XLS";
  return "FILE";
};

const handleDownload = async (attachment: IAttachment) => {
  const url = attachment.download_url;
  if (!url) return;

  try {
    const response = await _axios.get(toAbsoluteUrl(url), {
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = attachment.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(href);
  } catch {
    const link = document.createElement("a");
    link.href = toAbsoluteUrl(url);
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const handlePreview = (attachment: IAttachment) => {
  const url = attachment.preview_url || attachment.download_url;
  if (!url) return;
  window.open(toAbsoluteUrl(url), "_blank", "noopener");
};

export const AttachmentsPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  attachments,
}: IProps) => {
  return (
    <>
      <If is={!hideTab}>
        <div
          className="absolute z-20"
          style={{ right: -36, top: 10 }}
        >
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            whileHover={{ scale: 1.02 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            className={cn(
              "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
            )}
            aria-label="Вложения"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-teal-500" />
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
              <span className="bg-teal-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                {attachments.length}
              </span>
            </If>
          </motion.button>
        </div>
      </If>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{
              left: "calc(100% + 12px)",
              maxHeight: "var(--icc-panel-max-h, 70vh)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Paperclip size={14} className="text-teal-500" />
                <span className="font-semibold text-sm text-slate-800">
                  Вложения
                </span>
                <span className="bg-teal-50 text-teal-700 text-xs rounded-full px-2 py-0.5 font-semibold border border-teal-100">
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

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5 min-h-0">
              <If is={attachments.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Paperclip size={15} />
                  <span>Нет вложений</span>
                </div>
              </If>
              <If is={attachments.length > 0}>
                {attachments.map((attachment, idx) => (
                  <div
                    key={attachment.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 hover:bg-slate-100/70 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform border border-teal-100">
                        <If is={attachment.mime.includes("pdf")}>
                          <span className="text-[8px] font-bold">PDF</span>
                        </If>
                        <If is={!attachment.mime.includes("pdf")}>
                          <FileText size={14} />
                        </If>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                          {attachment.original_name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {[getMimeIcon(attachment.mime), formatSize(attachment.size)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePreview(attachment)}
                        className="text-slate-400 hover:text-teal-600 transition-colors flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-teal-50"
                        aria-label="Просмотр"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-blue-50"
                        aria-label="Скачать"
                      >
                        <Download size={13} />
                      </button>
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

export type { IAttachment };
