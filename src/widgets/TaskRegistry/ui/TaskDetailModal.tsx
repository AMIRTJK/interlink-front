import * as React from "react";
import { X } from "lucide-react";
import type { Task, TaskStatus } from "../model/types";
import { useTaskDetailModalState } from "./taskDetailModal/useTaskDetailModalState";
import { ModalContainer } from "./taskDetailModal/ModalContainer";
import { TaskDetailLeftColumn } from "./taskDetailModal/TaskDetailLeftColumn";
import { TaskDetailRightColumn } from "./taskDetailModal/TaskDetailRightColumn";
import { TaskDetailFooter } from "./taskDetailModal/TaskDetailFooter";

export const TaskDetailModal = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onUploadAttachments,
  onDownloadAttachment,
  onDeleteAttachment,
}: {
  task: Task;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => Promise<void> | void;
  onStatusChange?: (task: Task, status: TaskStatus) => Promise<void> | void;
  onUploadAttachments?: (taskId: number, files: File[]) => Promise<void> | void;
  onDownloadAttachment?: (
    taskId: number,
    attachmentId: number,
    fileName: string,
  ) => Promise<void> | void;
  onDeleteAttachment?: (
    taskId: number,
    attachmentId: number,
  ) => Promise<void> | void;
}) => {
  const {
    busy,
    confirmDelete,
    setConfirmDelete,
    handleStatus,
    handleDelete,
  } = useTaskDetailModalState({
    task,
    onStatusChange,
    onDelete,
  });

  return (
    <ModalContainer onClose={onClose}>
      <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
            {task.id}
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {task.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-y-auto">
        <TaskDetailLeftColumn
          task={task}
          onDownloadAttachment={onDownloadAttachment}
        />

        <TaskDetailRightColumn
          task={task}
        />
      </div>

      <TaskDetailFooter
        task={task}
        busy={busy}
        confirmDelete={confirmDelete}
        onConfirmDeleteChange={setConfirmDelete}
        onDelete={onDelete}
        onHandleDelete={handleDelete}
        onClose={onClose}
        onEdit={onEdit}
      />
    </ModalContainer>
  );
};
