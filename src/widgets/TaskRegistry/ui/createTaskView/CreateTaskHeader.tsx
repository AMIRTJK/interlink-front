import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
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
  isSaving,
  onSave,
  taskType,
  onTaskTypeChange,
}: IProps) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
            Назад
          </button>
          <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {isEdit ? "Редактирование задачи" : "Новая задача"}
          </h1>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 hover:brightness-110 rounded-2xl text-sm font-bold text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          <Plus size={18} />
          {isSaving
            ? "Сохранение..."
            : isEdit
              ? "Сохранить изменения"
              : "Создать задачу"}
        </button>
      </header>

      {/* Task type segmented control (только при создании) */}
      <div className={cn("flex items-center gap-4", isEdit && "hidden")}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Тип
        </span>
        <div className="inline-flex p-1.5 bg-white/50 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-sm">
          <button
            onClick={() => onTaskTypeChange("personal")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              taskType === "personal"
                ? "text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100",
            )}
          >
            {taskType === "personal" && (
              <motion.div
                layoutId="taskTypePill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-900/10"
              />
            )}
            <span className="relative z-10">Персональная задача</span>
          </button>
          <button
            onClick={() => onTaskTypeChange("protocol")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              taskType === "protocol"
                ? "text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100",
            )}
          >
            {taskType === "protocol" && (
              <motion.div
                layoutId="taskTypePill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-900/10"
              />
            )}
            <span className="relative z-10">Протокол</span>
          </button>
        </div>
      </div>
    </>
  );
}
