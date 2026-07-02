import React, { useState, useEffect } from "react";
import { X, Download, FileText, FileSpreadsheet, Archive, Image as ImageIcon, Eye } from "lucide-react";
import { IApiFile, formatBytes, getFileType } from "./lib";
import { If } from "@shared/ui";
import { _axios } from "@shared/api";
import { toast } from "react-toastify";

interface IProps {
  file: IApiFile | null;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, onClose }: IProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return;
    }

    const type = getFileType(file.extension);
    if (type === "image" || type === "pdf") {
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "blob" })
        .then((response) => {
          const url = URL.createObjectURL(response.data);
          setBlobUrl(url);
        })
        .catch((err) => {
          console.error("Failed to load preview blob", err);
          toast.error("Не удалось загрузить предпросмотр файла");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  if (!file) return null;

  const fileType = getFileType(file.extension);

  const getFormatIcon = (type: string) => {
    const iconSize = 48;
    switch (type) {
      case "pdf":
        return <div className="text-red-500 font-black text-3xl">PDF</div>;
      case "spreadsheet":
        return <FileSpreadsheet size={iconSize} className="text-green-500!" />;
      case "image":
        return <ImageIcon size={iconSize} className="text-rose-500!" />;
      case "archive":
        return <Archive size={iconSize} className="text-amber-500!" />;
      case "document":
      default:
        return <FileText size={iconSize} className="text-blue-500!" />;
    }
  };

  const handleDownload = async () => {
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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[400px]">
              Просмотр: {file.original_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-slate-50/30 dark:bg-slate-900/30">
          <If is={isLoading}>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Загрузка предпросмотра...</span>
            </div>
          </If>

          <If is={!isLoading && fileType === "image" && !!blobUrl}>
            <div className="w-full max-h-[350px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-black/5 dark:bg-black/20">
              <img
                src={blobUrl || ""}
                alt={file.original_name}
                className="max-w-full max-h-[350px] object-contain rounded-2xl"
              />
            </div>
          </If>

          <If is={!isLoading && fileType === "pdf" && !!blobUrl}>
            <div className="w-full h-[350px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
              <iframe
                src={blobUrl || ""}
                title={file.original_name}
                className="w-full h-full border-0 rounded-2xl"
              />
            </div>
          </If>

          <If is={!isLoading && fileType !== "image" && fileType !== "pdf"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                {getFormatIcon(fileType)}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
                  {file.original_name}
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Формат: {file.extension.toUpperCase()} • Размер: {formatBytes(file.size)}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto pt-2">
                  Этот тип файла не поддерживает предпросмотр в браузере. Вы можете скачать его на свой компьютер для работы.
                </p>
              </div>
            </div>
          </If>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-lg shadow-indigo-600/10 flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            <span>Скачать файл</span>
          </button>
        </div>
      </div>
    </div>
  );
};
