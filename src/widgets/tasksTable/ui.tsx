import { useState } from "react";
import { Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useGetQuery, useDynamicSearchParams, } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS_OPTIONS } from "@features/tasks";
import { useMutationQuery } from "@shared/lib";
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
  const [localTasks, setLocalTasks] = useState<ITaskItem[]>([]);
  const [lastSyncedData, setLastSyncedData] = useState<ITaskItem[] | undefined>(undefined);
  const { params } = useDynamicSearchParams();
  const { data: response, isPending: loading } = useGetQuery<
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
    }
  });

  const { mutateAsync: updateTaskStatus } = useMutationQuery<{ id: string; status: string }, unknown>({
    url: (data) => `${ApiRoutes.UPDATE_TASK_STATUS}/${data.id}/status`,
    method: "PATCH",
    messages: {
      error: "Ошибка обновления статуса",
    },
  });
  
  if (response?.data && response.data !== lastSyncedData) {
    setLocalTasks(response.data);
    setLastSyncedData(response.data);
  }

  const { mutateAsync: deleteTask } = useMutationQuery<string, unknown>({
    url: (taskId) => `${ApiRoutes.DELETE_TASK_BY_ID}${taskId}`,
    method: "DELETE",
    messages: {
      success: "Задача удалена",
      error: "Ошибка удаления задачи",
    },
  });

  const handleDeleteTask = async (taskId: string | number) => {
    const idStr = taskId.toString();
    const originalTasks = [...localTasks];
    setLocalTasks(localTasks.filter((t) => t.id.toString() !== idStr));

    try {
      await deleteTask(idStr);
    } catch (error) {
      console.error(error);
      setLocalTasks(originalTasks);
    }
  };

  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    const taskIndex = localTasks.findIndex((t) => t.id.toString() === taskId);
    if (taskIndex === -1) return;
    
    const updatedTasks = [...localTasks];
    const oldStatus = updatedTasks[taskIndex].status;
    
    if (oldStatus === newStatus) return;

    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
    setLocalTasks(updatedTasks);

    try {
      await updateTaskStatus({ id: taskId, status: newStatus });
    } catch (error) {
       console.log(error);
       const revertedTasks = [...localTasks]; 
       revertedTasks[taskIndex] = { ...revertedTasks[taskIndex], status: oldStatus };
       setLocalTasks(revertedTasks);
    }
  };
  const tasks = localTasks || [];
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
          disabled={loading}
          loading={loading}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
        </Button> 
      <If is={showFilters}>
        <TasksFilters />
      </If>
      </div>
      <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-4 overflow-x-auto p-2">
        {TASK_STATUS_OPTIONS?.map((option) => (
          <TasksColumn
            key={option.value}
            status={option.value}
            label={option.label}
            tasks={tasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onTaskDrop={handleTaskDrop}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>
    </div>
    );
  }
};
