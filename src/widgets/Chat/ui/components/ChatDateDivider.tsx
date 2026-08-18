import React from "react";

interface IProps {
  dateText: string;
  isStuck?: boolean;
  isScrolling?: boolean;
}

/**
 * Разделительная плашка с датой в ленте сообщений (Telegram-стиль):
 * - В обычном состоянии находится на своём естественном месте в ленте.
 * - При скролле фиксируется вверху (`sticky top-3.5 z-20`) и плавно гасится при остановке.
 * - Является ЕДИНЫМ элементом в DOM — исключает дублирование и наложение при скролле.
 */
export const ChatDateDivider: React.FC<IProps> = React.memo(
  ({ dateText, isStuck = false, isScrolling = false }) => {
    if (!dateText) return null;

    const isVisible = !isStuck || isScrolling;

    return (
      <div className="sticky top-3.5 z-20 flex items-center justify-center my-3.5 py-0.5 select-none pointer-events-none">
        <span
          className={`px-3.5 py-1 text-[11px] font-medium rounded-full shadow-xs border border-[var(--th-chip-border)] text-[var(--th-text-muted)] tracking-wide backdrop-blur-md transition-opacity duration-200 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "var(--th-chip-bg)",
          }}
        >
          {dateText}
        </span>
      </div>
    );
  },
);

ChatDateDivider.displayName = "ChatDateDivider";
