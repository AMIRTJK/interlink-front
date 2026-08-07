import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CornerUpLeft, Forward, MessageSquare, Pin, Trash2, Smile } from "lucide-react";

interface MessageActionMenuProps {
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 4 }}
      transition={{ duration: 0.14 }}
      className={`absolute top-8 ${isMe ? "left-0" : "right-0"} rounded-2xl shadow-2xl py-1.5 min-w-[130px] z-40 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/85 border border-white/30"}`}
      style={{
        boxShadow: isDark
          ? "0 8px 30px rgba(139,92,246,0.35)"
          : "0 8px 30px rgba(124,58,237,0.08)",
      }}
    >
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            a.fn();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-in-out group cursor-pointer ${a.danger ? (isDark ? "text-red-400 hover:bg-red-500/15" : "text-red-500 hover:bg-red-50") : isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"}`}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </motion.div>
  );
};
