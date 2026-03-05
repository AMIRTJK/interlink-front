import { Modal, Avatar, Button } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Task } from "@features/tasks";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import "./task-details-modal.css";

interface IProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export const TaskDetailsModal = ({ task, isOpen, onClose, onEdit }: IProps) => {
  if (!task) return null;

  /* Цвет события — используется для hero и акцентов */
  const color = task.color || "#6C63FF";

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={560}
      title={null}
      closable={true}
      className="task-details-modal"
      centered
      styles={{ body: { padding: 0 }, content: { borderRadius: 20, overflow: "hidden", padding: 0 } }}
      footer={null}
    >
      {/* Hero-шапка с цветом события */}
      <div
        className="task-details__hero"
        style={{
          background: `linear-gradient(135deg, ${color}28 0%, ${color}0f 100%)`,
          borderBottom: `2px solid ${color}22`,
        }}
      >
        {/* Бадж категории */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="task-details__badge" style={{ background: color }}>
            {task.category || "Событие"}
          </span>
        </motion.div>

        {/* Заголовок */}
        <motion.h2
          className="task-details__title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {task.title}
        </motion.h2>

        {/* Плашки: дата + время */}
        <motion.div
          className="task-details__chips"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="task-details__chip">
            <CalendarOutlined />
            {dayjs(task.date).format("D MMMM YYYY, ddd")}
          </span>
          <span className="task-details__chip">
            <ClockCircleOutlined />
            {task.time}{task.endTime ? ` — ${task.endTime}` : ""}
          </span>
        </motion.div>
      </div>

      {/* Основной контент */}
      <div className="task-details__body">
        {/* Описание */}
        {task.description && (
          <motion.div
            className="task-details__section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <p className="task-details__section-label">Описание</p>
            <p className="task-details__description">{task.description}</p>
          </motion.div>
        )}

        {/* Участники */}
        {task.participants && task.participants.length > 0 && (
          <motion.div
            className="task-details__section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="task-details__section-label">
              Участники ({task.participants.length})
            </p>
            <div className="task-details__participants">
              {task.participants.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="task-details__participant"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.25 }}
                >
                  <Avatar src={p.avatar} icon={<UserOutlined />} size={34} />
                  <span className="task-details__participant-name">{p.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Футер */}
      <motion.div
        className="task-details__footer"
        style={{ borderTop: `1px solid ${color}22` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <Button
          onClick={() => onEdit?.(task)}
          icon={<EditOutlined />}
          type="primary"
          size="large"
          style={{
            background: color,
            borderColor: "transparent",
            borderRadius: 10,
            fontWeight: 600,
            height: 40,
            paddingInline: 24,
          }}
        >
          Редактировать
        </Button>
      </motion.div>
    </Modal>
  );
};
