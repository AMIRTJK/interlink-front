import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { CornerUpLeft, Forward, MessageSquare, Pin, Trash2, Smile } from "lucide-react";

interface MessageActionMenuProps {
  buttonRect?: DOMRect | null;
  isMe: boolean;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
  onThread: () => void;
  onPin: () => void;
  onReactionClick?: () => void;
  pinLabel: string;
  onClose: () => void;
  isDark: boolean;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  buttonRect,
  isMe,
  onReply,
  onForward,
  onDelete,
  onThread,
  onPin,
  onReactionClick,
  pinLabel,
  onClose,
  isDark,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Иконки различаются не произвольными цветами, а ролями из палитры темы:
  // акцент — обычные действия, предупреждение — закрепление и реакции,
  // опасность — удаление.
  const iconClass = "w-3.5 h-3.5 transition-colors duration-200";

  const actions = [
    ...(onReactionClick
      ? [
          {
            icon: (
              <Smile
                className={`${iconClass} text-[rgb(var(--th-warning-rgb))]`}
                strokeWidth={1.8}
              />
            ),
            label: "Reaction",
            fn: onReactionClick,
            danger: false,
          },
        ]
      : []),
    {
      icon: (
        <CornerUpLeft
          className={`${iconClass} text-[var(--th-accent-text)]`}
          strokeWidth={1.8}
        />
      ),
      label: "Reply",
      fn: onReply,
      danger: false,
    },
    {
      icon: (
        <Forward
          className={`${iconClass} text-[rgb(var(--th-accent-3-rgb))]`}
          strokeWidth={1.8}
        />
      ),
      label: "Forward",
      fn: onForward,
      danger: false,
    },
    {
      icon: (
        <MessageSquare
          className={`${iconClass} text-[rgb(var(--th-accent-2-rgb))]`}
          strokeWidth={1.8}
        />
      ),
      label: "Thread",
      fn: onThread,
      danger: false,
    },
    {
      icon: (
        <Pin
          className={`${iconClass} text-[rgb(var(--th-warning-rgb))]`}
          strokeWidth={1.8}
        />
      ),
      label: pinLabel,
      fn: onPin,
      danger: false,
    },
    {
      icon: (
        <Trash2
          className={`${iconClass} text-[rgb(var(--th-danger-rgb))]`}
          strokeWidth={1.8}
        />
      ),
      label: "Delete",
      fn: onDelete,
      danger: true,
    },
  ];

  if (!buttonRect || (buttonRect.left === 0 && buttonRect.top === 0)) {
    return null;
  }

  const menuWidth = 145;
  const menuHeight = 190;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

  let leftPos = isMe
    ? buttonRect.left - menuWidth - 8
    : buttonRect.right + 8;
  leftPos = Math.max(12, Math.min(leftPos, viewportWidth - menuWidth - 12));

  let topPos = buttonRect.top > viewportHeight / 2
    ? buttonRect.top - menuHeight + 24
    : buttonRect.top;
  topPos = Math.max(16, Math.min(topPos, viewportHeight - menuHeight - 16));

  const portalContent = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, x: isMe ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: isMe ? 8 : -8 }}
      transition={{ duration: 0.14 }}
      className="fixed rounded-2xl shadow-2xl py-1.5 min-w-[140px] z-[9999] backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)] text-[var(--th-text)]"
      style={{
        left: leftPos,
        top: topPos,
        boxShadow: "0 10px 40px rgb(var(--th-shadow-rgb) / 0.35)",
      }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            a.fn();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-in-out group cursor-pointer ${
            a.danger
              ? "text-[rgb(var(--th-danger-rgb))] hover:bg-[rgb(var(--th-danger-rgb)/0.15)]"
              : "text-[var(--th-text-muted)] hover:bg-[var(--th-accent-soft)] hover:text-[var(--th-accent-text)]"
          }`}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </motion.div>
  );

  return typeof document !== "undefined"
    ? createPortal(portalContent, document.body)
    : portalContent;
};
