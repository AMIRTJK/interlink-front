import { AnimatePresence, motion } from "framer-motion";

interface IProps {
  isHighlighted?: boolean;
  /** Скругление повторяет скругление карточки-владельца. */
  rounded?: "lg" | "xl";
}

/**
 * Подсветка записи, к которой пользователь вернулся из просмотра письма.
 *
 * Появление и угасание ведёт framer-motion, а не CSS-переход: рамка монтируется
 * и размонтируется вместе с флагом, а `transition` на неродившемся элементе
 * анимировать нечего — отсюда и брались обе резкие смены состояния.
 */
export const HighlightOverlay = ({ isHighlighted, rounded = "lg" }: IProps) => (
  <AnimatePresence>
    {isHighlighted && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`absolute inset-0 ${
          rounded === "xl" ? "rounded-xl" : "rounded-lg"
        } ring-1 ring-inset ring-blue-500 border border-blue-500 pointer-events-none z-20 shadow-[0_0_14px_rgba(59,130,246,0.4)]`}
      />
    )}
  </AnimatePresence>
);
