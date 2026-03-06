import type { Task } from "@features/tasks";
import { Avatar } from "antd";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const color = task.color || "#6C63FF";

  return (
    <div
      className="task-card"
      style={{ 
        borderLeft: `4px solid ${color}`,
        background: `${color}59`, 
      }}
      onClick={onClick}
    >
      <div className="task-card__header">
        <div className="task-card__time" style={{ color: '#000' }}>
          {task.time}
        </div>
        {task.participants && task.participants.length > 0 && (
          <div className="task-card__avatars">
            <Avatar.Group max={{ count: 2, style: { color: color, backgroundColor: `${color}1A`, fontSize: '8px' } }}>
              {task.participants?.map((participant) => (
                <Avatar 
                  key={participant.id} 
                  src={participant.avatar} 
                  size={16}
                  alt={participant.name}
                />
              ))}
            </Avatar.Group>
          </div>
        )}
      </div>
      <div className="task-card__title" style={{ color: '#1e293b' }}>
        {task.title}
      </div>
    </div>
  );
};
