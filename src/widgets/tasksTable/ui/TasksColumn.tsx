import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination } from "antd";
import {  useState } from "react";
import { ITaskItem } from "../model";
import { StatusIcon } from "./StatusIcon";
import { TaskCard } from "./TaskCard";
import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

export const TasksColumn = ({
  status,
  label,
  tasks,
  onAddTask,
  onTaskClick,
  onTaskDrop,
  onDelete,
}: {
  status: string;
  label: string;
  tasks: ITaskItem[];
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
  onTaskDrop?: (taskId: string, status: string) => void;
  onDelete?: (taskId: string | number) => void;
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

   const { firstQueryData,} = useGetQuery({
     method: "GET",
     url: `${ApiRoutes.FETCH_PERMISSIONS}`,
     useToken: true,
     options: {
       enabled: tokenControl.get() !== null,
     },
    //  secondQuery: {
    //    url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
    //    method: "GET",
    //    shouldWaitFirst: true,
    //  },
   });

   const canCreateTask = firstQueryData?.data.find((item: {name: string})=>item.name === "tasks.create")
  return (
    <div 
      className="tasks-column"
      onDragOver={handleDragOver}
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
        {currentTasks?.length > 0 ? (
          currentTasks?.map((task) => (
            <TaskCard key={task?.id} task={task} onClick={onTaskClick} onDelete={onDelete} />
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
