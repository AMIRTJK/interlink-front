import * as React from "react";
import { Paperclip, Calendar, GripVertical } from "lucide-react";
import { cn } from "@shared/lib";
import type { Task, TaskStatus } from "../model/types";
import { STATUS_OPTIONS } from "../model/constants";
import { formatDueDate, getPriorityMeta } from "../lib/helpers";
import { Avatar } from "./Avatar";

interface TaskBoardViewProps {
  board: Record<TaskStatus, Task[]>;
  isLoading?: boolean;
  onOpenTask: (task: Task) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
}

// Порядок колонок доски (см. GET /api/v1/tasks/board).
const COLUMNS: TaskStatus[] = [
  "new",
  "in_progress",
  "review",
  "completed",
  "overdue",
];

const BoardCard = ({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (task: Task) => void;
}) => {
  const pMeta = getPriorityMeta(task.priority);
  return (
    <div
      draggable={task.rawId != null}
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", String(task.rawId));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onOpen(task)}
      className="group bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={16}
          className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
            {task.title}
          </p>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {task.id}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0",
            "bg-slate-50 dark:bg-slate-700/50",
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-full", pMeta.color)} />
          <span className={cn("text-[9px] font-black uppercase", pMeta.textColor)}>
            {pMeta.label}
          </span>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.progress > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                task.progress === 100 ? "bg-emerald-500" : "bg-emerald-400",
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {task.progress}%
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <Calendar size={12} />
          {task.dueDate ? formatDueDate(task.dueDate) : "—"}
        </div>
        <div className="flex items-center gap-2">
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
              <Paperclip size={11} />
              {task.attachments.length}
            </span>
          )}
          <Avatar colleague={task.assignee} className="w-6 h-6 text-[9px]" />
        </div>
      </div>
    </div>
  );
};

export const TaskBoardView = ({
  board,
  isLoading,
  onOpenTask,
  onStatusChange,
}: TaskBoardViewProps) => {
  const [dragOver, setDragOver] = React.useState<TaskStatus | null>(null);

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOver(null);
    const taskId = Number(e.dataTransfer.getData("taskId"));
    if (Number.isFinite(taskId) && taskId > 0) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const meta = STATUS_OPTIONS.find((o) => o.value === status)!;
        const items = board[status] || [];
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((prev) => (prev === status ? null : prev))}
            onDrop={(e) => handleDrop(e, status)}
            className={cn(
              "flex flex-col w-[300px] shrink-0 rounded-3xl border transition-colors",
              dragOver === status
                ? "bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500/40"
                : "bg-white/40 dark:bg-slate-900/40 border-white/30 dark:border-white/10",
            )}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/30 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", meta.color)} />
                <span className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  {meta.label}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                {items.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 p-3 min-h-[120px] max-h-[calc(100vh-360px)] overflow-y-auto">
              {items.length > 0 ? (
                items.map((task) => (
                  <BoardCard key={task.id} task={task} onOpen={onOpenTask} />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center py-10 text-center">
                  <p className="text-xs font-medium text-slate-400">
                    {isLoading ? "Загрузка..." : "Нет задач"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
