import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../model/useTasks";
import type { Task, TaskPayload, ViewState } from "../model/types";
import { TaskListView } from "./TaskListView";
import { CreateTaskView } from "./CreateTaskView";
import { TaskDetailModal } from "./TaskDetailModal";

export const TaskRegistry = () => {
  const {
    tasks,
    colleagues,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
  } = useTasks();
  const [view, setView] = React.useState<ViewState>("list");
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const handleCreate = async (payloads: TaskPayload[]) => {
    for (const payload of payloads) {
      await createTask(payload);
    }
    setView("list");
  };

  const handleUpdate = async (id: number, payload: TaskPayload) => {
    await updateTask(id, payload);
    setEditingTask(null);
    setView("list");
  };

  const handleDelete = async (task: Task) => {
    if (task.rawId == null) return;
    await deleteTask(task.rawId);
    setDetailTask(null);
  };

  const handleStatus = async (task: Task, status: Task["status"]) => {
    if (task.rawId == null) return;
    await updateStatus(task.rawId, status);
    setDetailTask((prev) => (prev ? { ...prev, status } : prev));
  };

  const openEdit = (task: Task) => {
    setDetailTask(null);
    setEditingTask(task);
    setView("create");
  };

  const leaveCreate = () => {
    setEditingTask(null);
    setView("list");
  };

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <TaskListView
            key="list"
            tasks={tasks}
            stats={stats}
            isLoading={isLoading}
            onOpenTask={setDetailTask}
            onCreate={() => {
              setEditingTask(null);
              setView("create");
            }}
          />
        ) : (
          <CreateTaskView
            key="create"
            colleagues={colleagues}
            editTask={editingTask}
            onBack={leaveCreate}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal (portal) */}
      <AnimatePresence>
        {detailTask && (
          <TaskDetailModal
            task={detailTask}
            onClose={() => setDetailTask(null)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatus}
            onUploadAttachments={uploadAttachments}
            onDownloadAttachment={downloadAttachment}
            onDeleteAttachment={deleteAttachment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
