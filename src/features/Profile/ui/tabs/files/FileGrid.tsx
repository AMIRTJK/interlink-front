import React from "react";
import { Pin, Trash2, Archive, FileText, FileSpreadsheet } from "lucide-react";
import { IFileItem } from "../mockData";

interface IProps {
  files: IFileItem[];
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (file: IFileItem) => void;
}

export const FileGrid = ({ files, onTogglePin, onDelete, onView }: IProps) => {
  const getCoverContent = (file: IFileItem) => {
    if (file.type === "image" && file.previewUrl) {
      return (
        <img
          src={file.previewUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    }

    switch (file.type) {
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
          <div className="w-full h-full bg-gradient-to-tr from-red-600 to-rose-500! flex items-center justify-center">
            <span className="text-white! font-black text-2xl tracking-wider">PDF</span>
          </div>
        );
      case "document":
      default:
        const isMarkdown = file.name.endsWith(".md");
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className="group bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 overflow-hidden transition-all duration-200"
        >
          {/* Cover Area */}
          <div
            onClick={() => onView(file)}
            className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
          >
            {getCoverContent(file)}

            {/* Pin indicator / Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(file.id);
              }}
              className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer ${
                file.pinned
                  ? "bg-amber-500! text-white! scale-100"
                  : "bg-black/40 text-white/80 hover:bg-black/60 scale-0 group-hover:scale-100 focus:scale-100"
              }`}
            >
              <Pin size={14} className={file.pinned ? "fill-white!" : ""} />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id);
              }}
              className="absolute top-3 left-3 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-red-600! hover:text-white! scale-0 group-hover:scale-100 focus:scale-100 transition-all cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Meta Area */}
          <div className="p-5 space-y-1">
            <h4
              onClick={() => onView(file)}
              className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate cursor-pointer hover:text-indigo-600 transition-colors"
              title={file.name}
            >
              {file.name}
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
              {file.size} <span className="mx-1">•</span> {file.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
