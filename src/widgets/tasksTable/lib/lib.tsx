import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination } from "antd";
import { useState } from "react";
import { TASK_STATUS } from "@features/tasks/model";
import { ITaskItem, months } from "../model";
import PendingIcon from "../../assets/icons/pending-icon.svg";
import InProgressIcon from "../../assets/icons/in-progress-icon.svg";
import CompletedIcon from "../../assets/icons/completed-icon.svg";
export const StatusIcon = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  const iconSize = 16;
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return (
        <img
          src={CompletedIcon}
          alt="Completed"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    case TASK_STATUS.IN_PROGRESS:
      return (
        <img
          src={InProgressIcon}
          alt="In Progress"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    case TASK_STATUS.PENDING:
      return (
        <img
          src={PendingIcon}
          alt="Pending"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    default:
      return <span style={{ width: iconSize, height: iconSize }} />;
  }
};

const getTaskProgressColor = (
  startedAt: string | null,
  plannedAt: string | null
): string => {
  if (!startedAt || !plannedAt) return "#E5E7EB";

  const start = new Date(startedAt).getTime();
  const end = new Date(plannedAt).getTime();
  const now = new Date().getTime();

  // Если время еще не пришло или даты некорректны
  if (now <= start) return "#E5E7EB";

  if (now >= end) return "#E12B2B";

  // Вычисляем середину срока
  const midPoint = start + (end - start) / 2;

  if (now >= midPoint) {
    return "#FFAC33";
  }

  return "#E5E7EB";
};

// eslint-disable-next-line react-refresh/only-export-components
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}`;
};

export const TaskCard = ({
  task,
  onClick,
}: {
  task: ITaskItem;
  onClick?: (task: ITaskItem) => void;
}) => {

  const borderColor = getTaskProgressColor(task.started_at, task.planned_at);
  return (
    <div
      className="task-card-task"
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

export const TasksColumn = ({
  status,
  label,
  tasks,
  onAddTask,
  onTaskClick,
}: {
  status: string;
  label: string;
  tasks: ITaskItem[];
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const columnTasks = tasks.filter((task) => task.status === status);
  
  const startIndex = (currentPage - 1) * pageSize;
  const currentTasks = columnTasks.slice(startIndex, startIndex + pageSize);

  return (
    <div className="tasks-column">
      <div className="tasks-column-header">
        <div className="flex items-center gap-1">
          <StatusIcon status={status} />
          <span className="font-semibold text-[14px]">{label}</span>
        </div>

        <Button
          onClick={() => onAddTask?.(status)}
          type="text"
          shape="circle"
          style={{ width: 40, height: 40, padding: 0 }}
          icon={<PlusOutlined className="text-[#0037AF]! text-[20px]!" />}
        />
      </div>
      <div className="tasks-list">
        {currentTasks.length > 0 ? (
          currentTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
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
