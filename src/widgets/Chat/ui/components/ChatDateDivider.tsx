import React from "react";

interface IProps {
  dateText: string;
}

/**
 * Разделительная плашка с датой в ленте сообщений (Telegram-стиль).
 * Центрируется по горизонтали, фиксируется при прокрутке дня и не перехватывает
 * клики мыши.
 */
export const ChatDateDivider: React.FC<IProps> = React.memo(({ dateText }) => {
  if (!dateText) return null;

  return (
    <div
      data-chat-date-divider="true"
      data-chat-date-text={dateText}
      className="flex items-center justify-center my-3.5 py-0.5 select-none pointer-events-none"
    >
      <span
        className="px-3.5 py-1 text-[11px] font-medium rounded-full shadow-xs border border-[var(--th-chip-border)] text-[var(--th-text-muted)] tracking-wide"
        style={{
          background: "var(--th-chip-bg)",
        }}
      >
        {dateText}
      </span>
    </div>
  );
});

ChatDateDivider.displayName = "ChatDateDivider";
