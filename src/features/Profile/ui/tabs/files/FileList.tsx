import React from "react";
import { Trash2, Archive, FileText, FileSpreadsheet, Image as ImageIcon, Eye, History, Share2, Download } from "lucide-react";
import { IFileItem } from "../mockData";
import { Tooltip } from "@shared/ui";

interface IProps {
  files: IFileItem[];
  selectedFileIds: string[];
  onToggleSelectFile: (id: string) => void;
  onView: (file: IFileItem) => void;
  onDelete: (id: string) => void;
}

export const FileList = ({
  files,
  selectedFileIds,
  onToggleSelectFile,
  onView,
  onDelete,
}: IProps) => {
  const getSmallIcon = (file: IFileItem) => {
    const baseClass = "w-7 h-7 rounded-lg flex items-center justify-center text-white! font-bold text-[10px]";
    switch (file.type) {
      case "pdf":
        return <div className={`${baseClass} bg-red-500!`}>PDF</div>;
      case "spreadsheet":
        return <div className={`${baseClass} bg-emerald-500!`}><FileSpreadsheet size={13} /></div>;
      case "image":
        return <div className={`${baseClass} bg-rose-500!`}><ImageIcon size={13} /></div>;
      case "archive":
        return <div className={`${baseClass} bg-amber-500!`}><Archive size={13} /></div>;
      case "document":
      default:
        const isMarkdown = file.name.endsWith(".md");
        const bg = isMarkdown ? "bg-slate-500!" : "bg-blue-500!";
        return <div className={`${baseClass} ${bg}`}><FileText size={13} /></div>;
    }
  };

  const getTypeBadge = (file: IFileItem) => {
    switch (file.type) {
      case "archive":
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500!" />
            <span>Архив</span>
          </div>
        );
      case "spreadsheet":
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500!" />
            <span>Таблица</span>
          </div>
        );
      case "pdf":
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500!" />
            <span>PDF</span>
          </div>
        );
      case "image":
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500!" />
            <span>Изображение</span>
          </div>
        );
      case "document":
      default:
        const isMarkdown = file.name.endsWith(".md");
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
            <span className={`w-1.5 h-1.5 rounded-full ${isMarkdown ? "bg-slate-400!" : "bg-blue-500!"}`} />
            <span>{isMarkdown ? "Файл" : "Документ"}</span>
          </div>
        );
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-4">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">
            <th className="py-4 px-4 w-12 text-center">
              {/* Checkbox header or empty */}
            </th>
            <th className="py-4 px-4">НАЗВАНИЕ</th>
            <th className="py-4 px-4 w-36">ТИП</th>
            <th className="py-4 px-4 w-28">РАЗМЕР</th>
            <th className="py-4 px-4 w-36">ДАТА</th>
            <th className="py-4 px-4 w-48 text-right">ДЕЙСТВИЯ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {files.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <tr
                key={file.id}
                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Checkbox */}
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectFile(file.id)}
                    className="rounded border-slate-200 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
                  />
                </td>

                {/* Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {getSmallIcon(file)}
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 transition-colors cursor-pointer">
                      {file.name}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="py-3 px-4">
                  {getTypeBadge(file)}
                </td>

                {/* Size */}
                <td className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  {file.size}
                </td>

                {/* Date */}
                <td className="py-3 px-4 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  {file.date}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                    <Tooltip title="Просмотр">
                      <button
                        type="button"
                        onClick={() => onView(file)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                    </Tooltip>
                    
                    <Tooltip title="История изменений">
                      <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                        <History size={15} />
                      </button>
                    </Tooltip>

                    <Tooltip title="Поделиться">
                      <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                        <Share2 size={15} />
                      </button>
                    </Tooltip>

                    <Tooltip title="Скачать">
                      <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                        <Download size={15} />
                      </button>
                    </Tooltip>

                    <Tooltip title="Удалить">
                      <button
                        type="button"
                        onClick={() => onDelete(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600! hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
