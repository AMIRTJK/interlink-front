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
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
  } = useTasks({ filters, active: view === "list", displayMode, page });

  const handleFilterChange = (patch: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleDisplayMode = (mode: TaskDisplayMode) => {
    setDisplayMode(mode);
    setPage(1);
  };

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
                onOpenTask={setDetailTask}
              />
            ) : (
              <TaskBoardView
                board={board}
                isLoading={isLoading}
                onOpenTask={setDetailTask}
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
