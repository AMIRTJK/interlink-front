import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Task } from "../../model/types";
import { formatDueDate, getPriorityMeta, getStatusMeta, getCountdown } from "../../lib/helpers";
import { Avatar } from "../Avatar";
import { CountdownTimer } from "../Countdown";

export function TaskDetailRightColumn({
  task,
}: {
  task: Task;
}) {
  const pMeta = getPriorityMeta(task.priority);
  const sMeta = getStatusMeta(task.status);

  return (
    <div className="w-80 p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/40">
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Исполнитель
          </label>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <Avatar colleague={task.assignee} className="w-10 h-10 text-xs" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {task.assignee.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {task.assignee.role}
              </p>
            </div>
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
