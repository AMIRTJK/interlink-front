import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IProps {
  dateText: string | null;
  isVisible: boolean;
}

/**
 * Плавающий индикатор даты при скролле (Telegram-стиль):
 * - Фиксируется по верхнему центру чата.
 * - Появляется во время активного скролла и плавно исчезает при остановке.
 * - Скрывается при достижении реального разделителя в ленте.
 */
export const ChatFloatingDate: React.FC<IProps> = React.memo(
  ({ dateText, isVisible }) => {
    return (
      <div className="absolute top-3.5 left-0 right-0 z-20 flex justify-center pointer-events-none select-none">
        <AnimatePresence>
          {isVisible && dateText ? (
            <motion.div
              key="floating-chat-date"
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="px-3.5 py-1 text-[11px] font-medium rounded-full shadow-md border border-[var(--th-chip-border)] text-[var(--th-text-muted)] tracking-wide backdrop-blur-md"
              style={{
                background: "var(--th-chip-bg)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={dateText}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.12 }}
                  className="inline-block"
                >
                  {dateText}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

ChatFloatingDate.displayName = "ChatFloatingDate";
