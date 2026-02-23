import { FC, ReactNode } from "react";
import { Empty, Button } from "antd";
import { motion } from "framer-motion";
import "./style.css";

interface IProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Компонент для отображения пустого состояния.
 * Используется, когда данных нет или они не найдены.
 */
export const EmptyState: FC<IProps> = ({
  title = "Список документов пуст",
  description = "Здесь будут отображаться ваши документы.",
  icon,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`empty ${className}`}
    >
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="empty__content">
            <h3 className="empty__title">{title}</h3>
            <p className="empty__description">{description}</p>
          </div>
        }
      >
        {actionText && onAction && (
          <Button
            type="primary"
            onClick={onAction}
            className="empty__action-btn"
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </motion.div>
  );
};
