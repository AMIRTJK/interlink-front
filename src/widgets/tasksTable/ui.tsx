import { useState, useEffect } from 'react';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { _axios } from '@shared/api';
import { ApiRoutes } from '@shared/api/api-routes';
import { TASK_STATUS, TASK_STATUS_OPTIONS } from '@features/tasks/model';
import type { ITaskItem, ITasksResponse } from './model';
import './style.css';

interface TasksTableProps {
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: ITaskItem) => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === TASK_STATUS.COMPLETED) {
    return (
      <span className={`status-icon ${status}`}>
        <CheckOutlined style={{ fontSize: 12, color: 'white' }} />
      </span>
    );
  }
  return <span className={`status-icon ${status}`} />;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
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
    <div className="task-card" onClick={() => onClick?.(task)}>
      <div className="task-card-header">
        <span className={`task-status-indicator ${task.status}`}>
          {task.status === TASK_STATUS.COMPLETED && (
            <CheckOutlined style={{ fontSize: 10, color: 'white' }} />
          )}
        </span>
        <div className="task-card-content">
          <div className="task-title">{task.title}</div>
          <div className="task-datetime">
            {formatDate(task.created_at)}
          </div>
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
  const columnTasks = tasks.filter(task => task.status === status);

  return (
    <div className="tasks-column">
      <div className="tasks-column-header">
        <div className="tasks-column-title">
          <StatusIcon status={status} />
          <span>{label}</span>
        </div>
        <button
          className="add-task-btn"
          onClick={() => onAddTask?.(status)}
          type="button"
        >
          <PlusOutlined />
        </button>
      </div>
      <div className="tasks-list">
        {columnTasks.length > 0 ? (
          columnTasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        ) : (
          <div className="empty-column">Нет задач</div>
        )}
      </div>
    </div>
  );
};

export const TasksTable = ({
  onAddTask,
  onTaskClick,
}: TasksTableProps) => {
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
    <div className="tasks-table">
      {TASK_STATUS_OPTIONS.map(option => (
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
