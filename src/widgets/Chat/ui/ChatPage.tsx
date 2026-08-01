import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { ChatApp } from "./ChatApp";
import { useChat } from "../lib/ChatContext";

// ─── Чат как полноценный раздел системы ───────────────────────────────────────
// Монтируется на маршруте AppRoutes.CHAT и сразу занимает весь экран — так же,
// как всплывающий чат после нажатия «Развернуть». Рендерится в портал поверх
// раскладки модуля: сама система остаётся смонтированной и просвечивает сквозь
// полупрозрачное стекло чата. Выход из раздела — кнопкой в шапке, она возвращает
// в предыдущий раздел. Всплывающее окно быстрого доступа здесь не нужно —
// закрываем его при входе, чтобы чат не дублировался на экране.

export const ChatPage = () => {
  const navigate = useNavigate();
  const { closeChat } = useChat();

  useEffect(() => {
    closeChat();
  }, [closeChat]);

  // Пока раздел открыт, прокрутка страницы под ним не нужна.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleExit = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(AppRoutes.PROFILE);
  }, [navigate]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[900]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="region"
      aria-label="Чат"
    >
      <ChatApp variant="page" onRequestClose={handleExit} />
    </motion.div>,
    document.body,
  );
};
