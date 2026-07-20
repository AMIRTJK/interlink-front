import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../model/useTasks";
import type { Task, TaskPayload, TaskStatus, ViewState } from "../model/types";
import {
  DEFAULT_FILTERS,
  type TaskDisplayMode,
  type TaskFilters,
} from "../model/filters";
import { TaskStatsCards } from "./TaskStatsCards";
import { TasksFilterBar } from "./TasksFilterBar";
import { TaskListView } from "./TaskListView";
import { TaskBoardView } from "./TaskBoardView";
import { CreateTaskView } from "./CreateTaskView";
import { TaskDetailModal } from "./TaskDetailModal";

export const TaskRegistry = () => {
  const [view, setView] = React.useState<ViewState>("list");
  const [displayMode, setDisplayMode] = React.useState<TaskDisplayMode>("table");
  const [filters, setFilters] = React.useState<TaskFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const {
    tasks,
    pagination,
    board,
    colleagues,
    stats,
    isLoading,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
  } = useTasks({ filters, active: view === "list", displayMode, page });

  // Открытие карточки: мгновенно показываем снимок из списка, затем подтягиваем
  // свежую задачу через GET /tasks/{id}.
  const openDetail = async (task: Task) => {
    setDetailTask(task);
    if (task.rawId == null) return;
    const fresh = await getTaskById(task.rawId);
    if (fresh) {
      setDetailTask((prev) =>
        prev && prev.rawId === task.rawId ? fresh : prev,
      );
    }
  };

  const refreshDetail = async (taskId: number) => {
    const fresh = await getTaskById(taskId);
    if (fresh) {
      setDetailTask((prev) => (prev && prev.rawId === taskId ? fresh : prev));
    }
  };

  const handleUpload = async (taskId: number, files: File[]) => {
    await uploadAttachments(taskId, files);
    await refreshDetail(taskId);
  };

  const handleDeleteAttachment = async (taskId: number, attachmentId: number) => {
    await deleteAttachment(taskId, attachmentId);
    await refreshDetail(taskId);
  };

  const handleFilterChange = (patch: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleDisplayMode = (mode: TaskDisplayMode) => {
    setDisplayMode(mode);
    setPage(1);
  };

  const handleCreate = async (payloads: TaskPayload[], files?: File[]) => {
    for (const payload of payloads) {
      const created = await createTask(payload);
      const createdId = created?.id;
      if (files && files.length > 0 && createdId) {
        await uploadAttachments(createdId, files);
      }
    }
    setView("list");
  };

  const handleUpdate = async (id: number, payload: TaskPayload, files?: File[]) => {
    await updateTask(id, payload);
    if (files && files.length > 0) {
      await uploadAttachments(id, files);
    }
    setEditingTask(null);
    setView("list");
  };

  const handleDelete = async (task: Task) => {
    if (task.rawId == null) return;
    await deleteTask(task.rawId);
    setDetailTask(null);
  };

  const handleStatus = async (task: Task, status: TaskStatus) => {
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
          <div key="list" className="w-full pb-10 relative z-10 flex flex-col gap-6">
            <TaskStatsCards stats={stats} />
            <TasksFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              stats={stats}
              colleagues={colleagues}
              displayMode={displayMode}
              onDisplayModeChange={handleDisplayMode}
              onCreate={() => {
                setEditingTask(null);
                setView("create");
              }}
              count={
                displayMode === "table"
                  ? pagination.total
                  : (stats?.total ??
                    Object.values(board).reduce((n, arr) => n + arr.length, 0))
              }
            />
            {displayMode === "table" ? (
              <TaskListView
                tasks={tasks}
                pagination={pagination}
                page={page}
                onPageChange={setPage}
                isLoading={isLoading}
                onOpenTask={openDetail}
              />
            ) : (
              <TaskBoardView
                board={board}
                isLoading={isLoading}
                onOpenTask={openDetail}
                onStatusChange={(id, status) => updateStatus(id, status)}
              />
            )}
          </div>
        ) : (
          <CreateTaskView
            key="create"
            colleagues={colleagues}
            editTask={editingTask}
            onBack={leaveCreate}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDownloadAttachment={downloadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
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
            onUploadAttachments={handleUpload}
            onDownloadAttachment={downloadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
