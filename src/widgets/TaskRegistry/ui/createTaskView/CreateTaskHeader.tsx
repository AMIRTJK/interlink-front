import { ChevronLeft } from "lucide-react";
import { cn } from "@shared/lib";
import type { TaskType } from "../../model/types";

interface IProps {
  onBack: () => void;
  isEdit: boolean;
  isSaving: boolean;
  onSave: () => void;
  taskType: TaskType;
  onTaskTypeChange: (type: TaskType) => void;
}

export function CreateTaskHeader({
  onBack,
  isEdit,
  taskType,
  onTaskTypeChange,
}: IProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Title Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-[#ebedfa] dark:bg-slate-800/90 border border-[#d2d8f8] dark:border-white/10 rounded-xl text-xs font-bold text-[#7e85b0] hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ChevronLeft size={15} />
          <span>Назад</span>
        </button>
        <h1 className="text-2xl font-black text-[#1e2348] dark:text-slate-100 tracking-tight">
          {isEdit ? "Редактирование задачи" : "Новая задача"}
        </h1>
      </div>

      {/* Task type pills (только при создании) */}
      <div className={cn("flex items-center gap-2", isEdit && "hidden")}>
        <button
          onClick={() => onTaskTypeChange("personal")}
          className={cn(
            "px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border",
            taskType === "personal"
              ? "bg-white dark:bg-slate-800 border-[#10b981] text-[#10b981] dark:text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.12)] font-extrabold"
              : "bg-[#f4f6fe] dark:bg-slate-800/50 border-[#e4e8fc] dark:border-white/10 text-[#9aa2c8] hover:text-[#7e85b0]",
          )}
        >
          Персональная задача
        </button>
        <button
          onClick={() => onTaskTypeChange("protocol")}
          className={cn(
            "px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border",
            taskType === "protocol"
              ? "bg-white dark:bg-slate-800 border-[#10b981] text-[#10b981] dark:text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.12)] font-extrabold"
              : "bg-[#f4f6fe] dark:bg-slate-800/50 border-[#e4e8fc] dark:border-white/10 text-[#9aa2c8] hover:text-[#7e85b0]",
          )}
        >
          Протокол
        </button>
      </div>
    </div>
  );
}
