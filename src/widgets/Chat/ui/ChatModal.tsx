import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChatApp } from "./ChatApp";

// ─── Чат в формате Drawer, выезжающего справа ─────────────────────────────────
// Быстрый доступ к чату из любого модуля: оверлей поверх текущего экрана системы,
// без перехода по навигации и смены активного раздела. Полноценный раздел «Чат»
// живёт на маршруте AppRoutes.CHAT (см. ChatPage).
// Открывается как Drawer: плавно выезжает справа, при закрытии так же плавно
// уезжает вправо. В компактном режиме чат прижат вплотную к правому краю (см.
// ChatApp), а за ним видна сама система — отдельного фона нет; в развёрнутом
// занимает весь экран. Закрытие — по Esc, кнопкой в шапке или кликом по пустому
// пространству за окном чата.
// Рендерится в портал (document.body), чтобы не зависеть от overflow/z-index
// родителей и всегда быть сверху.

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
  /** Развёрнут ли чат на весь экран. */
  isExpanded: boolean;
  /** Переключение «компактное окно ↔ весь экран». */
  onToggleExpand: () => void;
};

export const ChatModal = ({
  open,
  onClose,
  isExpanded,
  onToggleExpand,
}: ChatModalProps) => {
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
          initial={{ x: "100%" }}
          animate={{
            x: 0,
            transition: { type: "tween", duration: 0.6, ease: [0.32, 0.72, 0, 1] },
          }}
          exit={{
            x: "100%",
            // Зеркальная кривая (ease-in) для закрытия, чтобы видимая часть
            // движения шла с той же скоростью, что и при открытии.
            transition: { type: "tween", duration: 0.6, ease: [1, 0, 0.68, 0.28] },
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Чат"
        >
          <div className="w-full h-full">
            <ChatApp
              variant="overlay"
              onRequestClose={onClose}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
