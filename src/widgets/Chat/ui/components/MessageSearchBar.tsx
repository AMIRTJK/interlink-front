import React from "react";
import { motion } from "framer-motion";
import { SearchIcon, ChevronUp, ChevronDown, X } from "lucide-react";

interface MessageSearchBarProps {
  query: string;
  onChange: (v: string) => void;
  onClose: () => void;
  matchCount: number;
  currentMatch: number;
  onPrev: () => void;
  onNext: () => void;
  isDark: boolean;
  placeholder: string;
}

export const MessageSearchBar: React.FC<MessageSearchBarProps> = ({
  query,
  onChange,
  onClose,
  matchCount,
  currentMatch,
  onPrev,
  onNext,
  placeholder,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex items-center gap-2 px-6 py-2.5 border-b backdrop-blur-md border-[var(--th-divider)] bg-[var(--th-composer-bg)]"
  >
    <SearchIcon className="w-4 h-4 flex-shrink-0 text-[var(--th-text-faint)]" />
    <input
      autoFocus
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 bg-transparent text-xs font-medium outline-none text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
    />
    {query.trim() && (
      <span className="text-[10px] font-semibold flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--th-chip-bg)] text-[var(--th-text-muted)]">
        {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "0/0"}
      </span>
    )}
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        aria-label="Предыдущее совпадение"
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${matchCount > 0 ? "hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]" : "opacity-30 cursor-not-allowed"}`}
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        aria-label="Следующее совпадение"
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${matchCount > 0 ? "hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]" : "opacity-30 cursor-not-allowed"}`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
    <button
      onClick={onClose}
      aria-label="Закрыть поиск"
      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);
