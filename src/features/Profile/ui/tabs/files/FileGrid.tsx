import React from "react";
import { Pin, Trash2, Archive, FileText, FileSpreadsheet, Eye, History, Share2, Download, Folder } from "lucide-react";
import { IApiFile, getFileType, formatBytes } from "./lib";
import { Tooltip } from "@shared/ui";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";

interface IProps {
  files: IApiFile[];
  onTogglePin: (file: IApiFile) => void;
  onDelete: (id: number) => void;
  onView: (file: IApiFile) => void;
  onMove?: (file: IApiFile) => void;
}

export const FileGrid = ({
  files,
  onTogglePin,
  onDelete,
  onView,
  onMove,
}: IProps) => {
  const getCoverContent = (file: IApiFile) => {
    const fileType = getFileType(file.extension);

    if (fileType === "image") {
      // In grid view we can't easily fetch authenticated image on the fly,
      // but wait, we can just render the icon, or load preview.
      // Rendering the image icon is simple and fits standard file managers,
      // let's show a nice clean visual gradient + image icon!
      return (
        <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center">
          <Eye size={42} className="text-white!" />
        </div>
      );
    }

    switch (fileType) {
      case "archive":
        return (
          <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-orange-400! flex items-center justify-center">
            <Archive size={42} className="text-white!" />
          </div>
        );
      case "spreadsheet":
        return (
          <div className="w-full h-full excel-grid-bg flex items-center justify-center">
            <FileSpreadsheet size={42} className="text-white!" />
          </div>
        );
      case "pdf":
        return (
          <div className="w-full h-full bg-gradient-to-tr from-red-650 to-rose-550! flex items-center justify-center">
            <span className="text-white! font-black text-2xl tracking-wider">PDF</span>
          </div>
        );
      case "document":
      default:
        const isMarkdown = file.original_name.endsWith(".md");
        const gradient = isMarkdown 
          ? "from-slate-600 to-slate-500!" 
          : "from-blue-600 to-indigo-500!";
        return (
          <div className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center`}>
            <FileText size={42} className="text-white!" />
          </div>
        );
    }
  };

  const handleDownload = async (file: IApiFile) => {
    try {
      const response = await _axios.get(file.download_url, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.original_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Не удалось скачать файл");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className="group bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-650 overflow-hidden transition-all duration-200"
        >
          {/* Cover Area */}
          <div
            onClick={() => onView(file)}
            className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
          >
            {getCoverContent(file)}

            {/* Pin / Star toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(file);
              }}
              className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer ${
                file.is_starred
                  ? "bg-amber-500! text-white! scale-100"
                  : "bg-black/40 text-white/80 hover:bg-black/60 scale-0 group-hover:scale-100 focus:scale-100"
              }`}
            >
              <Pin size={14} className={file.is_starred ? "fill-white!" : ""} />
            </button>
          </div>

          {/* Meta Area */}
          <div className="p-5 space-y-1">
            <h4
              onClick={() => onView(file)}
              className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate cursor-pointer hover:text-indigo-650 transition-colors"
              title={file.original_name}
            >
              {file.original_name}
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
              {formatBytes(file.size)} <span className="mx-1">•</span> {formatDate(file.created_at)}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2.5">
              <Tooltip title="Просмотр">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(file);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye size={14} />
                </button>
              </Tooltip>

              <Tooltip title="Скачать">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </button>
              </Tooltip>

              {onMove && (
                <Tooltip title="Переместить">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(file);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Folder size={14} />
                  </button>
                </Tooltip>
              )}

              <Tooltip title="Удалить">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  className="p-1 text-slate-400 hover:text-red-600! dark:hover:text-red-500! rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
