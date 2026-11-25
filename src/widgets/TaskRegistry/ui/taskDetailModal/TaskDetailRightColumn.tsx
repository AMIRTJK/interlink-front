import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import type { Task } from "../../model/types";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../../lib/helpers";
import { CountdownTimer } from "../Countdown";
import { ColleagueCard } from "./ColleagueCard";

export function TaskDetailRightColumn({
  task,
}: {
  task: Task;
}) {
  const pMeta = getPriorityMeta(task.priority);
  const sMeta = getStatusMeta(task.status);

  return (
    <div className="w-80 p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/40 overflow-y-auto shrink-0">
      <div className="space-y-4">
        <If is={!!task.creator}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Создатель
            </label>
            {task.creator && <ColleagueCard colleague={task.creator} />}
          </div>
        </If>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {(task.assignees && task.assignees.length > 1) ? "Исполнители" : "Исполнитель"}
          </label>
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
            {((task.assignees && task.assignees.length > 0) ? task.assignees : [task.assignee]).map((col, idx) => (
              <ColleagueCard key={col.id || idx} colleague={col} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Приоритет
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
              <div className={cn("w-2 h-2 rounded-full", pMeta.color)} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {pMeta.label}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Статус
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
              <div className={cn("w-2 h-2 rounded-full", sMeta.color)} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {sMeta.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Срок
          </label>
          <div className="flex flex-col gap-1 px-3 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Calendar size={14} />
              <span className="text-xs font-bold">
                {formatDueDate(task.dueDate)}
              </span>
            </div>
            <If is={task.status !== "completed" && getCountdown(task.dueDate).type !== "overdue"}>
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/10">
                <CountdownTimer dueDate={task.dueDate} />
              </div>
            </If>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Создано
          </label>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {formatDueDate(task.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
