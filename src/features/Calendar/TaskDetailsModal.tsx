import { Modal, Avatar, Button } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Task } from "@features/tasks";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
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
      width={600}
      title={null}
      closable={true}
      className="task-details-modal"
      centered
      styles={{ body: { padding: 0 } }}
      footer={null}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Hero-шапка с цветом события */}
            <div
              className="task-details__hero"
              style={{
                background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
                borderBottom: `1px solid ${color}22`,
              }}
            >
              {/* Бадж категории */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <span className="task-details__badge" style={{ background: color }}>
                  {task.category || "Событие"}
                </span>
              </motion.div>

              {/* Заголовок */}
              <motion.h2
                className="task-details__title"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {task.title}
              </motion.h2>

              {/* Плашки: дата + время */}
              <motion.div
                className="task-details__chips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="task-details__chip">
                  <CalendarOutlined style={{ color }} />
                  {dayjs(task.date).format("D MMMM YYYY, ddd")}
                </div>
                <div className="task-details__chip">
                  <ClockCircleOutlined style={{ color }} />
                  {task.time}{task.endTime ? ` — ${task.endTime}` : ""}
                </div>
              </motion.div>
            </div>

            {/* Основной контент */}
            <div className="task-details__body">
              {/* Описание */}
              {task.description && (
                <motion.div
                  className="task-details__section"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <p className="task-details__section-label">Описание</p>
                  <p className="task-details__description">{task.description}</p>
                </motion.div>
              )}

              {/* Участники */}
              {task.participants && task.participants.length > 0 && (
                <motion.div
                  className="task-details__section"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <p className="task-details__section-label">
                    Участники ({task.participants.length})
                  </p>
                  <div className="task-details__participants">
                    {task.participants.map((p, i) => (
                      <motion.div
                        key={p.id}
                        className="task-details__participant"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
                      >
                        <Avatar src={p.avatar} icon={<UserOutlined />} size={36} />
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => onEdit?.(task)}
                  icon={<EditOutlined />}
                  type="primary"
                  size="large"
                  className="rounded-2xl h-12 px-8 font-bold shadow-lg"
                  style={{
                    background: color,
                    borderColor: "transparent",
                  }}
                >
                  Редактировать
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
