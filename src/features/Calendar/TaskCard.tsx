// import { VideoCameraFilled } from "@ant-design/icons";
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
        backgroundColor: `${color}3A`, 
      }}
      onClick={onClick}
    >
      <div className="task-card__content">
        <div className="task-card__time" style={{ color: '#000' }}>
          {task.time}
          {/* <VideoCameraFilled style={{ marginLeft: "6px", fontSize: "14px" }} /> */}
        </div>
        <div className="task-card__title" style={{ color: '#000' }}>
          {task.title}
        </div>
        {task.participants && task.participants.length > 0 && (
          <div className="task-card__avatars">
            <Avatar.Group max={{ count: 3, style: { color: color, backgroundColor: `${color}1A`, fontSize: '10px' } }}>
              {task.participants?.map((participant) => (
                <Avatar 
                  key={participant.id} 
                  src={participant.avatar} 
                  size={20}
                  style={{ border: `1px solid ${color}33` }}
                  alt={participant.name}
                >
                  {participant.name.charAt(0)}
                </Avatar>
              ))}
            </Avatar.Group>
          </div>
        )}
      </div>
    </div>
  );
};
