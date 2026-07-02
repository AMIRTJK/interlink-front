import React from "react";
import { X, FileText, FileSpreadsheet, Image as ImageIcon, Archive, File } from "lucide-react";
import { IFileItem } from "../mockData";
import { If } from "@shared/ui";

interface IProps {
  pinnedFiles: IFileItem[];
  onUnpin: (id: string) => void;
}

export const PinnedFiles = ({ pinnedFiles, onUnpin }: IProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={14} className="text-red-500!" />;
      case "spreadsheet":
        return <FileSpreadsheet size={14} className="text-green-500!" />;
      case "image":
        return <ImageIcon size={14} className="text-cyan-500!" />;
      case "archive":
        return <Archive size={14} className="text-amber-500!" />;
      default:
        return <File size={14} className="text-blue-500!" />;
    }
  };

  return (
    <If is={pinnedFiles.length > 0}>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500! tracking-wider uppercase">
          ЗАКРЕПЛЁННЫЕ
        </div>
        <div className="flex flex-wrap gap-2">
          {pinnedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-slate-700 dark:text-zinc-300 font-medium transition-all hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
            >
              {getIcon(file.type)}
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => onUnpin(file.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-0.5 rounded-full cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </If>
  );
};
