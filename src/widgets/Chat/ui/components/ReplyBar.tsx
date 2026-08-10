import React from "react";
import { motion } from "framer-motion";
import { CornerUpLeft, X } from "lucide-react";
import { ReplyPreview } from "../../model";

interface ReplyBarProps {
  reply: ReplyPreview;
  onCancel: () => void;
  isDark: boolean;
}

export const ReplyBar: React.FC<ReplyBarProps> = ({ reply, onCancel }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 6 }}
    className="mx-6 mb-2 flex items-center gap-3 rounded-2xl px-3 py-2 border bg-[var(--th-accent-soft)] border-[var(--th-accent-border)] text-[var(--th-text)]"
  >
    <div className="w-1 h-8 rounded-full flex-shrink-0 bg-[var(--th-accent-text)]" />
    <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0 text-[var(--th-accent-text)]" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-[var(--th-accent-text)]">
        {reply.senderName}
      </p>
      <p className="text-xs truncate text-[var(--th-text-muted)]">{reply.text}</p>
    </div>
    <button
      type="button"
      onClick={onCancel}
      aria-label="Отменить ответ"
      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-faint)] hover:text-[var(--th-text)]"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);
