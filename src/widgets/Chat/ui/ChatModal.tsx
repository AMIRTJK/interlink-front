import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ChatApp } from "./ChatApp";

// ─── Полноэкранное модальное окно чата ────────────────────────────────────────
// Чат не является отдельной страницей — это оверлей поверх текущего экрана системы.
// Открытие/закрытие анимируется (затемнение фона + масштабирование содержимого),
// закрытие доступно по кнопке и по Esc. Рендерится в портал (document.body), чтобы
// не зависеть от overflow/z-index родительских контейнеров и всегда быть сверху.

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ChatModal = ({ open, onClose }: ChatModalProps) => {
  // Esc для закрытия + блокировка прокрутки основной страницы, пока чат открыт.
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Чат"
        >
          <motion.div
            className="w-full h-full"
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <ChatApp />
          </motion.div>

          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Закрыть чат"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="fixed top-5 right-5 z-[1001] w-11 h-11 rounded-full flex items-center justify-center text-white/90 backdrop-blur-xl border border-white/20 shadow-lg transition-colors hover:text-white cursor-pointer focus:outline-none"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
