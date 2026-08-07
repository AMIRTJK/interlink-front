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

  const actions = [
    ...(onReactionClick
      ? [
          {
            icon: (
              <Smile
                className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-amber-400 group-hover:text-amber-300" : "text-amber-500 group-hover:text-amber-600"}`}
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
          className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-indigo-400 group-hover:text-indigo-300" : "text-indigo-500 group-hover:text-indigo-600"}`}
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
          className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-sky-400 group-hover:text-sky-300" : "text-sky-500 group-hover:text-sky-600"}`}
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
          className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-emerald-400 group-hover:text-emerald-300" : "text-emerald-500 group-hover:text-emerald-600"}`}
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
          className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-amber-400 group-hover:text-amber-300" : "text-amber-500 group-hover:text-amber-600"}`}
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
          className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-red-400 group-hover:text-red-300" : "text-red-500 group-hover:text-red-600"}`}
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
      className={`fixed rounded-2xl shadow-2xl py-1.5 min-w-[140px] z-[9999] ${
        isDark
          ? "backdrop-blur-2xl bg-zinc-900/95 border border-white/20 text-white"
          : "backdrop-blur-2xl bg-white/95 border border-black/10 text-gray-800 shadow-xl"
      }`}
      style={{
        left: leftPos,
        top: topPos,
        boxShadow: isDark
          ? "0 10px 40px rgba(0,0,0,0.6)"
          : "0 10px 40px rgba(0,0,0,0.15)",
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
              ? isDark
                ? "text-red-400 hover:bg-red-500/15"
                : "text-red-500 hover:bg-red-50"
              : isDark
                ? "text-white/80 hover:bg-white/10 hover:text-white"
                : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
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
