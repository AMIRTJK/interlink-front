import { useState } from "react";
import { Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useGetQuery, useDynamicSearchParams } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS_OPTIONS } from "@features/tasks/model";
import type { ITaskItem, ITasksResponse } from "./model";
import { TasksColumn } from "./ui/TasksColumn";
import { TasksFilters } from "./ui/TasksFilters";
import "./style.css";
import { If, Loader } from "@shared/ui";

interface IProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}
export const TasksTable = ({ onAddTask, onTaskClick }: IProps) => {
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
    options:{
      enabled: !!params,
      keepPreviousData: true,
      refetchOnMount: true,
      staleTime: 60 * 60 * 1000,
    }
  });
  const tasks = response?.data || [];
  if (loading) {
    return (
      <Loader/>
    );
  }else{
    return (
      <div className="tasks-table-wrapper">
      <div className={`${showFilters ? "tasks-table-header" : "tasks-table-header-collapsed"}`}>
        <Button
          className={showFilters ? "tasks-table-header-button" : "tasks-table-header-button-collapsed"}
          icon={<FilterOutlined />} 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
        </Button> 
      <If is={showFilters}>
        <TasksFilters />
      </If>
      </div>
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
  }
};
