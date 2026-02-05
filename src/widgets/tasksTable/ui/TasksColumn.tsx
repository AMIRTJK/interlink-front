import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination } from "antd";
import { useState } from "react";
import { ITaskItem } from "../model";
import { StatusIcon } from "./StatusIcon";
import { TaskCard } from "./TaskCard";
import { useGetQuery } from "@shared/lib";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";
import "../style.css";

export const TasksColumn = ({
  isPending,
  status,
  label,
  tasks,
  onAddTask,
  onTaskClick,
  onTaskDrop,
  onDelete,
}: {
  isPending: boolean;
  status: string;
  label: string;
  tasks: ITaskItem[];
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
  onTaskDrop?: (taskId: string, status: string) => void;
  onDelete?: (taskId: string | number) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskDrop?.(taskId, status);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const columnTasks = tasks.filter((task) => task.status === status);

  const startIndex = (currentPage - 1) * pageSize;
  const currentTasks = columnTasks.slice(startIndex, startIndex + pageSize);

  const { data: canCreateTask } = useGetQuery({
    preload: true,
    preloadConditional: ["tasks.create"],
  });

  return (
    <div 
      className={`tasks-column ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="tasks-column-header">
        <div className="flex items-center gap-1">
          <StatusIcon status={status} />
          <span className="font-semibold text-[14px]">{label}</span>
        </div>

        <Button
          onClick={() => onAddTask?.(status)}
          type="text"
          shape="circle"
          className={`${canCreateTask ? 'block!':'hidden!'}`}
          style={{ width: 40, height: 40, padding: 0 }}
          icon={<PlusOutlined className="text-[#0037AF]! text-[20px]!" />}
        />
      </div>
      <div className="tasks-list">
        <UseSkeleton loading={isPending} variant="card" count={1} rows={4}  />
        {currentTasks?.length > 0 ? (
          currentTasks?.map((task) => (
            <TaskCard key={task?.id} task={task} onClick={onTaskClick} onEdit={onTaskClick} onDelete={onDelete} />
          ))
        ) : (
          <div className="empty-column">Нет задач</div>
        )}
      </div>
      {columnTasks.length > pageSize && (
        <div className="flex justify-center p-2">
          <Pagination
            simple
            current={currentPage}
            onChange={setCurrentPage}
            total={columnTasks.length}
            pageSize={pageSize}
            size="small"
          />
        </div>
      )}
    </div>
  );
};
