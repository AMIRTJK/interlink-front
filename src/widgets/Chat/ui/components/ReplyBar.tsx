import React from "react";
import { motion } from "framer-motion";
import { CornerUpLeft, X } from "lucide-react";
import { ReplyPreview } from "../../model";

interface ReplyBarProps {
  reply: ReplyPreview;
  onCancel: () => void;
  isDark: boolean;
}

export const ReplyBar: React.FC<ReplyBarProps> = ({
  reply,
  onCancel,
  isDark,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 6 }}
    className={`mx-6 mb-2 flex items-center gap-3 rounded-2xl px-3 py-2 border ${
      isDark
        ? "bg-violet-500/15 border-violet-400/20 text-white"
        : "bg-violet-500/8 border-violet-500/15 text-gray-800"
    }`}
  >
    <div
      className={`w-1 h-8 rounded-full flex-shrink-0 ${
        isDark ? "bg-violet-400" : "bg-violet-600"
      }`}
    />
    <CornerUpLeft
      className={`w-3.5 h-3.5 flex-shrink-0 ${
        isDark ? "text-violet-300" : "text-violet-600"
      }`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-[10px] font-semibold ${
          isDark ? "text-violet-300" : "text-violet-600"
        }`}
      >
        {reply.senderName}
      </p>
      <p
        className={`text-xs truncate ${
          isDark ? "text-white/70" : "text-gray-600"
        }`}
      >
        {reply.text}
      </p>
    </div>
    <button
      type="button"
      onClick={onCancel}
      aria-label="Отменить ответ"
      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer ${
        isDark
          ? "hover:bg-white/15 text-white/50 hover:text-white"
          : "hover:bg-black/5 text-gray-400 hover:text-gray-700"
      }`}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);
