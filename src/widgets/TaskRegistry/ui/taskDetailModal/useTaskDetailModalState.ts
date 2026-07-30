import * as React from "react";
import type { Task, TaskStatus } from "../../model/types";

interface IUseTaskDetailModalStateProps {
  task: Task;
  onStatusChange?: (task: Task, status: TaskStatus) => Promise<void> | void;
  onDelete?: (task: Task) => Promise<void> | void;
  onUploadAttachments?: (taskId: number, files: File[]) => Promise<void> | void;
}

export function useTaskDetailModalState({
  task,
  onStatusChange,
  onDelete,
  onUploadAttachments,
}: IUseTaskDetailModalStateProps) {
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || task.rawId == null || !onUploadAttachments) return;
    setUploading(true);
    try {
      await onUploadAttachments(task.rawId, files);
    } finally {
      setUploading(false);
    }
  };

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
    uploading,
    fileInputRef,
    handleUpload,
    handleStatus,
    handleDelete,
  };
}
