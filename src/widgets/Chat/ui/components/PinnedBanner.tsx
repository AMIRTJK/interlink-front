import React from "react";
import { motion } from "framer-motion";
import { Pin, X } from "lucide-react";
import { Message } from "../../model";

interface PinnedBannerProps {
  message: Message;
  onDismiss: () => void;
  onJump: () => void;
  isDark: boolean;
  label: string;
}

export const PinnedBanner: React.FC<PinnedBannerProps> = ({
  message,
  onDismiss,
  onJump,
  isDark,
  label,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
    className={`mx-6 mt-3 mb-0 flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer group transition-all duration-200 ease-in-out ${
      isDark ? "hover:bg-violet-500/20" : "hover:bg-violet-500/12"
    }`}
    style={{
      background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.12)",
      border: isDark
        ? "1px solid rgba(167,139,250,0.25)"
        : "1px solid rgba(124,58,237,0.3)",
    }}
    onClick={onJump}
  >
    <div
      className="w-1 h-8 rounded-full flex-shrink-0"
      style={{
        background: "linear-gradient(180deg,#7c3aed,#06b6d4)",
      }}
    />
    <Pin
      className={`w-3.5 h-3.5 flex-shrink-0 ${
        isDark ? "text-violet-300" : "text-violet-700 font-bold"
      }`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${
          isDark ? "text-violet-300" : "text-violet-700"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xs truncate ${
          isDark ? "text-white/70" : "text-gray-900 font-medium"
        }`}
      >
        {message.text}
      </p>
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      aria-label="Скрыть закреплённое сообщение"
      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer ${
        isDark ? "hover:bg-white/15 text-white/50 hover:text-white" : "hover:bg-black/5 text-gray-500 hover:text-gray-900"
      }`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);
