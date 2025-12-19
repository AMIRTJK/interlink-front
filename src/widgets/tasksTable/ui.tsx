import { useState } from "react";
import { Spin, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS_OPTIONS } from "@features/tasks/model";
import type { ITaskItem, ITasksResponse } from "./model";
import { TasksColumn } from "./ui/TasksColumn";
import { TasksFilters } from "./ui/TasksFilters";
import "./style.css";

interface TasksTableProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}

export const TasksTable = ({ onAddTask, onTaskClick }: TasksTableProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const { params } = useDynamicSearchParams();
  
  const { data: response, isLoading: loading } = useGetQuery<
    Record<string, string>,
    ITasksResponse
  >({
    url: ApiRoutes.GET_TASKS,
    method: "GET",
    params,
    useToken: true,
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
    <div className="tasks-table-wrapper">
      <div className="tasks-table-header">
        <Button 
          icon={<FilterOutlined />} 
          onClick={() => setShowFilters(!showFilters)}
          type={showFilters ? "primary" : "default"}
        >
          Фильтры
        </Button>
      </div>

      {showFilters && <TasksFilters />}

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
    </div>
  );
};
