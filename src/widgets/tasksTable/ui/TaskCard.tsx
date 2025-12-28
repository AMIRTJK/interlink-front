import { ITaskItem } from "../model";
import { getTaskProgressColor, formatDate } from "../lib/utils";
import { StatusIcon } from "./StatusIcon";

import { useState } from "react";

export const TaskCard = ({
  task,
  onClick,
}: {
  task: ITaskItem;
  onClick?: (task: ITaskItem) => void;
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
      <div className="task-card-header">
        <StatusIcon status={task.status} className="mt-[3px]!" />
        <div className="task-card-content">
          <div className="task-title">{task.title}</div>
          <div className="task-desc">{task.description}</div>
          <div className="task-datetime">{formatDate(task.created_at)}</div>
        </div>
      </div>
    </div>
  );
};
