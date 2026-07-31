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
    className={`mx-6 mt-3 mb-0 flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer group transition-all duration-200 ease-in-out ${isDark ? "hover:bg-violet-500/20" : "hover:bg-violet-500/10"}`}
    style={{
      background: isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
      border: isDark
        ? "1px solid rgba(167,139,250,0.25)"
        : "1px solid rgba(124,58,237,0.2)",
    }}
    onClick={onJump}
  >
    <div
      className="w-0.5 h-8 rounded-full flex-shrink-0"
      style={{
        background: "linear-gradient(180deg,#a78bfa,#67e8f9)",
      }}
    />
    <Pin
      className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-violet-300" : "text-violet-600"}`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-violet-300" : "text-violet-600"}`}
      >
        {label}
      </p>
      <p
        className={`text-xs truncate ${isDark ? "text-white/60" : "text-gray-600"}`}
      >
        {message.text}
      </p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out ${isDark ? "hover:bg-white/15 text-white/40" : "hover:bg-black/5 text-gray-500"}`}
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);
