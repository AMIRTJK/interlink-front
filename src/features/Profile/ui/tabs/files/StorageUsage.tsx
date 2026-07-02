import React from "react";
import { HardDrive } from "lucide-react";
import { IFileItem } from "../mockData";

interface IProps {
  files: IFileItem[];
}

export const StorageUsage = ({ files }: IProps) => {
  // Вычисляем размеры динамически для интерактивности
  const totalCapacityBytes = 1024 * 1024 * 1024; // 1 GB
  const usedBytes = files.reduce((acc, file) => acc + file.sizeBytes, 0);
  
  // Добавим фиксированную базовую часть бэкапов для соответствия скриншоту (~923 MB)
  const baseFakeBytes = 30 * 1024 * 1024; // Для точной подгонки, если нужно
  const totalUsedBytes = Math.min(usedBytes + baseFakeBytes, totalCapacityBytes);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const percentage = (totalUsedBytes / totalCapacityBytes) * 100;

  // Группировка файлов для легенды
  const getCountByType = (type: string) => {
    return files.filter((f) => f.type === type).length;
  };

  const legendItems = [
    { label: "PDF", count: getCountByType("pdf"), color: "bg-blue-500!" },
    { label: "Документы", count: getCountByType("document"), color: "bg-cyan-400!" },
    { label: "Таблицы", count: getCountByType("spreadsheet"), color: "bg-fuchsia-500!" },
    { label: "Изображения", count: getCountByType("image"), color: "bg-yellow-400!" },
    { label: "Архивы", count: getCountByType("archive"), color: "bg-zinc-400!" },
    { label: "Другое", count: files.filter((f) => !["pdf", "document", "spreadsheet", "image", "archive"].includes(f.type)).length, color: "bg-zinc-600!" },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 font-semibold text-sm">
          <HardDrive size={16} className="text-slate-400" />
          <span>Хранилище</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
          {formatSize(totalUsedBytes)} / 1 GB
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="storage-progress-bar h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span>{item.label}</span>
            <span className="text-slate-800 dark:text-zinc-200 font-bold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
