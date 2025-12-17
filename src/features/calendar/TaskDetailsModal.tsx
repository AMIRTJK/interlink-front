import { Modal, Avatar } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { Task } from "@features/tasks";
import dayjs from "dayjs";
import "./task-details-modal.css";

interface IProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal = ({ task, isOpen, onClose }: IProps) => {
  if (!task) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      title={null}
      closable={true}
      className="task-details-modal-view"
      centered
    >
      <div className="task-details">
        <div className="task-details__header-bg">
          <div
            className="task-details__category-badge"
            style={{ backgroundColor: task.color || "#1890ff" }}
          >
            {task.category || "Событие"}
          </div>
          <h2 className="task-details__title">{task.title}</h2>
        </div>

        <div className="task-details__content">
          <div className="task-details__meta-row">
            <div className="task-details__meta-item">
              <CalendarOutlined className="task-details__meta-icon" />
              <span>{dayjs(task.date).format("D MMMM YYYY, dddd")}</span>
            </div>
            <div className="task-details__meta-item">
              <ClockCircleOutlined className="task-details__meta-icon" />
              <span>
                {task.time} - {task.endTime}
              </span>
            </div>
          </div>

          {task.description && (
            <div className="task-details__section">
              <h3 className="task-details__label">Описание</h3>
              <p className="task-details__description">{task.description}</p>
            </div>
          )}

          {task.participants && task.participants.length > 0 && (
            <div className="task-details__section">
              <h3 className="task-details__label">
                Участники ({task.participants.length})
              </h3>
              <div className="task-details__participants">
                {task.participants.map((p) => (
                  <div key={p.id} className="task-details__participant">
                    <Avatar src={p.avatar} icon={<UserOutlined />} size={32} />
                    <span className="task-details__participant-name">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
