import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@shared/lib";
import {
  PriorityLevel,
  ExecutorUser,
  priorityConfig,
  priorityKeys,
} from "./taskFormFields/taskFormFieldsModel";
import { ExecutorSearchInput } from "./taskFormFields/ExecutorSearchInput";

export type { PriorityLevel, ExecutorUser };

interface IProps {
  selectedExecutor: ExecutorUser | null;
  setSelectedExecutor: (u: ExecutorUser | null) => void;
  taskText: string;
  setTaskText: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  priority: PriorityLevel;
  setPriority: (p: PriorityLevel) => void;
  note: string;
  setNote: (v: string) => void;
}

export const TaskFormFields: React.FC<IProps> = ({
  selectedExecutor,
  setSelectedExecutor,
  taskText,
  setTaskText,
  deadline,
  setDeadline,
  priority,
  setPriority,
  note,
  setNote,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-left">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Исполнитель
        </label>
        <ExecutorSearchInput
          selectedExecutor={selectedExecutor}
          setSelectedExecutor={setSelectedExecutor}
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Поручение
        </label>
        <textarea
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Опишите задачу..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Срок исполнения
        </label>
        <div className="relative">
          <Calendar
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Приоритет
        </label>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {priorityKeys.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold transition-all border-r last:border-r-0 border-slate-200 cursor-pointer",
                priority === p
                  ? priorityConfig[p].activeClass
                  : priorityConfig[p].inactiveClass
              )}
            >
              {priorityConfig[p].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Примечание
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Дополнительные сведения..."
          rows={2}
          className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
        />
      </div>
    </div>
  );
};
