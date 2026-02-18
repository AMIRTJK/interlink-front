import { useState } from "react";
import { useGetQuery, useDynamicSearchParams, } from "@shared/lib";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS_OPTIONS } from "@features/tasks";
import { useMutationQuery } from "@shared/lib";
import type { ITaskItem, ITasksResponse } from "./model";
import { TasksColumn } from "./ui/TasksColumn";
import { TasksFilters } from "./ui/TasksFilters";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";
import "./style.css";

interface IProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}

export const TasksTable = ({ onAddTask, onTaskClick }: IProps) => {
  const [localTasks, setLocalTasks] = useState<ITaskItem[]>([]);
  const { params } = useDynamicSearchParams();

  const { isPending } = useGetQuery<
    any,
    ITasksResponse
  >({
    url: ApiRoutes.GET_TASKS,
    method: "GET",
    params:{
      per_page:String(1),
      ...params
    },
    useToken: true,
    preload: true,
    preloadConditional: ["tasks.create"],
    
    options: {
      enabled: !!params,
      keepPreviousData: true,
      refetchOnMount: true,
      onSuccess: (data) => {
        if (data?.data) {
          setLocalTasks(data.data);
        }
      },
    },
  });

  const { mutateAsync: updateTaskStatus } = useMutationQuery<
    { id: string; status: string },
    unknown
  >({
    url: (data) => `${ApiRoutes.UPDATE_TASK_STATUS}/${data.id}/status`,
    method: "PATCH",
    messages: {
      error: "Ошибка обновления статуса",
    },
  });

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
       const revertedTasks = [...localTasks]; 
       revertedTasks[taskIndex] = { ...revertedTasks[taskIndex], status: oldStatus };
       setLocalTasks(revertedTasks);
       console.error(error);
    }
  };

  const tasks = localTasks || [];

  if (isPending) {
    return <UseSkeleton loading={true} variant="card" count={1} rows={5}  />;
  }

  return (
    <div className="tasks-table-wrapper">
      <TasksFilters />
      <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-4 overflow-x-auto p-2">
        {TASK_STATUS_OPTIONS?.map((option) => (
          <TasksColumn
            isPending={isPending}
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
};
