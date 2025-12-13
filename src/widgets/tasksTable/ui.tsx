import { useState, useEffect } from "react";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Spin } from "antd";
import { _axios } from "@shared/api";
import { ApiRoutes } from "@shared/api/api-routes";
import { TASK_STATUS, TASK_STATUS_OPTIONS } from "@features/tasks/model";
import type { ITaskItem, ITasksResponse } from "./model";
import "./style.css";

import PendingIcon from "../../assets/icons/pending-icon.svg";
import InProgressIcon from "../../assets/icons/in-progress-icon.svg";
import CompletedIcon from "../../assets/icons/completed-icon.svg";

interface TasksTableProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}

const StatusIcon = ({
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}`;
};

const TaskCard = ({
  task,
  onClick,
}: {
  task: ITaskItem;
  onClick?: (task: ITaskItem) => void;
}) => {
  return (
    <div className="task-card-task" onClick={() => onClick?.(task)}>
      <div className="task-card-header">
        <StatusIcon status={task.status} className="mt-[3px]!" />
        <div className="task-card-content">
          <div className="task-title">{task.title}</div>
          <div className="task-datetime">{formatDate(task.created_at)}</div>
        </div>
      </div>
    </div>
  );
};

const TasksColumn = ({
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
  const columnTasks = tasks.filter((task) => task.status === status);

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
        {columnTasks.length > 0 ? (
          columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        ) : (
          <div className="empty-column">Нет задач</div>
        )}
      </div>
    </div>
  );
};

export const TasksTable = ({ onAddTask, onTaskClick }: TasksTableProps) => {
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await _axios.get<ITasksResponse>(ApiRoutes.GET_TASKS);
        setTasks(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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
