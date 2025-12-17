import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { TASK_STATUS } from "@features/tasks/model";
import { ITaskItem, months } from "./model";
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
  if (!startedAt || !plannedAt) return "#E5E7EB"; // Дефолтный серый (если даты не заданы)

  const start = new Date(startedAt).getTime();
  const end = new Date(plannedAt).getTime();
  const now = new Date().getTime();

  // Если время еще не пришло или даты некорректны
  if (now <= start) return "#E5E7EB"; // Серый

  // Если срок уже вышел или наступил
  if (now >= end) return "#E12B2B"; // Красный

  // Вычисляем середину срока
  const midPoint = start + (end - start) / 2;

  // Если текущее время перевалило за середину
  if (now >= midPoint) {
    return "#FFAC33"; // Оранжевый
  }

  return "#E5E7EB"; // Серый (до середины срока)
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
  console.log(task);

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
