import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useTasks } from "../model/useTasks";
import type { Task, ViewState } from "../model/types";
import { TaskListView } from "./TaskListView";
import { CreateTaskView } from "./CreateTaskView";
import { TaskDetailModal } from "./TaskDetailModal";

export const TaskRegistry = () => {
  const { tasks, colleagues, addTask } = useTasks();
  const [view, setView] = React.useState<ViewState>("list");
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <TaskListView
            key="list"
            tasks={tasks}
            onOpenTask={setDetailTask}
            onCreate={() => setView("create")}
          />
        ) : (
          <CreateTaskView
            key="create"
            colleagues={colleagues}
            onBack={() => setView("list")}
            onCreated={addTask}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal (portal) */}
      <AnimatePresence>
        {detailTask && (
          <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
