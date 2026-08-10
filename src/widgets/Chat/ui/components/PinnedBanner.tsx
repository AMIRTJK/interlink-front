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
  label,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
    className="mx-6 mt-3 mb-0 flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer group transition-all duration-200 ease-in-out hover:bg-[var(--th-accent-soft-strong)]"
    style={{
      background: "var(--th-accent-soft)",
      border: "1px solid var(--th-accent-border)",
    }}
    onClick={onJump}
  >
    <div
      className="w-1 h-8 rounded-full flex-shrink-0"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))",
      }}
    />
    <Pin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--th-accent-text)]" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--th-accent-text)]">
        {label}
      </p>
      <p className="text-xs truncate text-[var(--th-text-muted)]">
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
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-faint)] hover:text-[var(--th-text)]"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);
