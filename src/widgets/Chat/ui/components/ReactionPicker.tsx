import React from "react";
import { motion } from "framer-motion";
import { QUICK_REACTIONS } from "../../model";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  isMe: boolean;
  isDark: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  isMe,
  isDark,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.9 }}
    transition={{ duration: 0.15 }}
    className={`absolute -top-10 ${isMe ? "right-0" : "left-0"} flex items-center gap-0.5 rounded-full px-2 py-1 z-30 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
    style={{
      boxShadow: isDark
        ? "0 4px 20px rgba(139,92,246,0.4)"
        : "0 4px 20px rgba(124,58,237,0.08)",
    }}
  >
    {QUICK_REACTIONS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => onSelect(emoji)}
        className={`w-8 h-8 flex items-center justify-center text-lg rounded-full transition-all duration-150 ease-in-out hover:scale-125 ${isDark ? "hover:bg-white/20" : "hover:bg-black/5"}`}
      >
        <span>{emoji}</span>
      </button>
    ))}
  </motion.div>
);
