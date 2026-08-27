import * as React from "react";
import type { Task, TaskStatus } from "../../model/types";

interface IUseTaskDetailModalStateProps {
  task: Task;
  onStatusChange?: (task: Task, status: TaskStatus) => Promise<void> | void;
  onDelete?: (task: Task) => Promise<void> | void;
}

export function useTaskDetailModalState({
  task,
  onStatusChange,
  onDelete,
}: IUseTaskDetailModalStateProps) {
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleStatus = async (status: TaskStatus) => {
    if (!onStatusChange || status === task.status) return;
    setBusy(true);
    try {
      await onStatusChange(task, status);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try {
      await onDelete(task);
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    confirmDelete,
    setConfirmDelete,
    handleStatus,
    handleDelete,
  };
}
