import { ITaskItem } from "../model";
import { getTaskProgressColor, formatDate } from "../lib/utils";
import { StatusIcon } from "./StatusIcon";

import { DeleteOutlined } from "@ant-design/icons";
import { PopConfirm } from "@shared/ui";
import { Button } from "antd";
import { useState } from "react";

export const TaskCard = ({
  task,
  onClick,
  onDelete,
}: {
  task: ITaskItem;
  onClick?: (task: ITaskItem) => void;
  onDelete?: (taskId: string | number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const borderColor = getTaskProgressColor(task.started_at, task.planned_at);
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`task-card-task ${isDragging ? "dragging" : ""}`}
      onClick={() => onClick?.(task)}
      style={{
        borderBottom: `2px solid ${borderColor}`,
      }}
    >
      <div className="task-card-header relative">
        <StatusIcon status={task.status} className="mt-[3px]!" />
        <div className="task-card-content w-full">
          <div className="flex justify-between items-start">
            <div className="task-title pr-6">{task.title}</div>
            <div onClick={(e) => e.stopPropagation()}>
              <PopConfirm
                title="Удалить задачу?"
                onConfirm={() => onDelete?.(task.id)}
                placement="topRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined className="task-card-delete-btn" />}
                />
              </PopConfirm>
            </div>
          </div>
          <div className="task-desc">{task.description}</div>
          <div className="task-datetime">{formatDate(task.created_at)}</div>
        </div>
      </div>
    </div>
  );
};
