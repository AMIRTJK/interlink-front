import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Archive,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { IApiFile, formatBytes, getFileType } from "./lib";
import { If } from "@shared/ui";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface IProps {
  file: IApiFile | null;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, onClose }: IProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    "image" | "pdf" | "html-doc" | "html-xls" | "text" | "none"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      setHtmlContent(null);
      setTextContent(null);
      setPreviewType("none");
      return;
    }

    const ext = file.extension.toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
    const isPdf = ext === "pdf";
    const isDocx = ext === "docx";
    const isXlsx = ["xlsx", "xls", "csv"].includes(ext);
    const isText = [
      "txt",
      "json",
      "log",
      "md",
      "ts",
      "tsx",
      "js",
      "jsx",
    ].includes(ext);

    let activeUrl: string | null = null;

    if (isImage) {
      setPreviewType("image");
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "blob" })
        .then((response) => {
          const url = URL.createObjectURL(response.data);
          activeUrl = url;
          setBlobUrl(url);
        })
        .catch((err) => {
          console.error("Failed to load image preview", err);
          toast.error("Не удалось загрузить предпросмотр изображения");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (isPdf) {
      setPreviewType("pdf");
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "blob" })
        .then((response) => {
          const url = URL.createObjectURL(response.data);
          activeUrl = url;
          setBlobUrl(url);
        })
        .catch((err) => {
          console.error("Failed to load PDF preview", err);
          toast.error("Не удалось загрузить предпросмотр PDF");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (isDocx) {
      setPreviewType("html-doc");
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "blob" })
        .then(async (response) => {
          const arrayBuffer = await response.data.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value || "<p>Пустой документ</p>");
        })
        .catch((err) => {
          console.error("Failed to parse DOCX preview", err);
          toast.error("Не удалось обработать документ Word");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (isXlsx) {
      setPreviewType("html-xls");
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "blob" })
        .then(async (response) => {
          const arrayBuffer = await response.data.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          if (workbook.SheetNames.length > 0) {
            const sheetName = workbook.SheetNames[0];
            const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
            setHtmlContent(html);
          } else {
            setHtmlContent("<p>Пустой Excel файл</p>");
          }
        })
        .catch((err) => {
          console.error("Failed to parse Excel preview", err);
          toast.error("Не удалось обработать таблицу Excel");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (isText) {
      setPreviewType("text");
      setIsLoading(true);
      _axios
        .get(file.preview_url, { responseType: "text" })
        .then((response) => {
          setTextContent(String(response.data));
        })
        .catch((err) => {
          console.error("Failed to load text preview", err);
          toast.error("Не удалось загрузить текст файла");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setPreviewType("none");
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [file]);

  if (!file) return null;

  const fileType = getFileType(file.extension);

  const getFormatIcon = (type: string) => {
    const iconSize = 48;
    switch (type) {
      case "pdf":
        return <FileText size={iconSize} className="text-red-500!" />;
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
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
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
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-[92vw]! xl:max-w-[1600px]! overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-8 flex flex-col items-center justify-center min-h-[420px] bg-slate-50/30 dark:bg-slate-900/30">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .file-preview-paper {
              background: white;
              color: #000;
              width: 100%;
              text-align: left;
            }
            .file-preview-paper.doc-mode {
              font-family: "Times New Roman", serif;
              line-height: 1.5;
            }
            .file-preview-paper.doc-mode p {
              margin-bottom: 12px;
            }
            .file-preview-paper.doc-mode table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .file-preview-paper.doc-mode td,
            .file-preview-paper.doc-mode th {
              border: 1px solid #000;
              padding: 4px;
            }
            .file-preview-paper.xls-mode {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .file-preview-paper.xls-mode table {
              border-collapse: collapse;
              width: 100%;
            }
            .file-preview-paper.xls-mode td,
            .file-preview-paper.xls-mode th {
              border: 1px solid #ccc;
              padding: 5px;
              white-space: nowrap;
            }
            .file-preview-paper.xls-mode th {
              background: #f0fdf4;
              font-weight: bold;
              color: #166534;
              text-align: center;
            }
            .file-preview-text {
              white-space: pre-wrap;
              word-break: break-all;
              font-family: monospace;
              font-size: 13px;
            }
          `,
            }}
          />

          <If is={isLoading}>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                Загрузка предпросмотра...
              </span>
            </div>
          </If>

          <If is={!isLoading && previewType === "image" && !!blobUrl}>
            <div className="w-full max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-black/5 dark:bg-black/20">
              <img
                src={blobUrl || ""}
                alt={file.original_name}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl"
              />
            </div>
          </If>

          <If is={!isLoading && previewType === "pdf" && !!blobUrl}>
            <div className="w-full h-[70vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
              <iframe
                src={blobUrl || ""}
                title={file.original_name}
                className="w-full h-full border-0 rounded-2xl"
              />
            </div>
          </If>

          <If is={!isLoading && previewType === "html-doc" && !!htmlContent}>
            <div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white text-left">
              <div
                className="file-preview-paper doc-mode"
                dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
              />
            </div>
          </If>

          <If is={!isLoading && previewType === "html-xls" && !!htmlContent}>
            <div className="w-full max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white text-left">
              <div
                className="file-preview-paper xls-mode"
                dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
              />
            </div>
          </If>

          <If is={!isLoading && previewType === "text" && textContent !== null}>
            <div className="w-full max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 text-left">
              <pre className="file-preview-text text-slate-700 dark:text-zinc-300">
                {textContent}
              </pre>
            </div>
          </If>

          <If is={!isLoading && previewType === "none"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                {getFormatIcon(fileType)}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-zinc-200">
                  {file.original_name}
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Формат: {file.extension.toUpperCase()} • Размер:{" "}
                  {formatBytes(file.size)}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto pt-2">
                  Этот тип файла не поддерживает предпросмотр в браузере. Вы
                  можете скачать его на свой компьютер для работы.
                </p>
              </div>
            </div>
          </If>
        </div>

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
