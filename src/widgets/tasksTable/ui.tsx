import { Spin } from "antd";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS_OPTIONS } from "@features/tasks/model";
import type { ITaskItem, ITasksResponse } from "./model";
import { TasksColumn } from "./lib";
import "./style.css";

interface TasksTableProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}

export const TasksTable = ({ onAddTask, onTaskClick }: TasksTableProps) => {
  const { data: response, isLoading: loading } = useGetQuery<
    unknown,
    ITasksResponse
  >({
    url: ApiRoutes.GET_TASKS,
    method: "GET",
  });

  const tasks = response?.data || [];

  if (loading) {
    return (
      <div className="tasks-table-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-4 overflow-x-auto p-2">
      {TASK_STATUS_OPTIONS.map((option) => (
        <TasksColumn
          key={option.value}
          status={option.value}
          label={option.label}
          tasks={tasks}
          onAddTask={onAddTask}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
