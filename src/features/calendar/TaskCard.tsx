import { Avatar } from "antd";
import type { Task } from "@features/tasks";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getCategoryColor = (category?: Task['category']) => {
  switch (category) {
    case 'work':
      return '#FF6B6B';
    case 'personal':
      return '#4ECDC4';
    case 'important':
      return '#FFD93D';
    case 'meeting':
      return '#A78BFA';
    default:
      return '#6C63FF';
  }
};

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const borderColor = task.color || getCategoryColor(task.category);
  
  return (
    <div 
      className="task-card" 
      style={{ borderLeftColor: borderColor }}
      onClick={onClick}
    >
      <div className="task-card__header">
        <span 
          className="task-card__time-badge"
          style={{ backgroundColor: borderColor }}
        >
          {task.time}
        </span>
        {task.endTime && (
          <span 
            className="task-card__time-badge"
            style={{ backgroundColor: borderColor }}
          >
            {task.endTime}
          </span>
        )}
      </div>
      <div className="task-card__title">{task.title}</div>
      {task.participants && task.participants.length > 0 && (
        <Avatar.Group 
          max={{ count: 3 }} 
          size="small"
          className="task-card__avatars"
        >
          {task.participants.map((participant) => (
            <Avatar 
              key={participant.id}
              src={participant.avatar}
            >
              {!participant.avatar && participant.name.charAt(0)}
            </Avatar>
          ))}
        </Avatar.Group>
      )}
    </div>
  );
};
