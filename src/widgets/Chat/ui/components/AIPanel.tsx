import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, X } from "lucide-react";
import { AI_SUGGESTIONS } from "../../model";

interface AIPanelProps {
  onSelect: (text: string) => void;
  onClose: () => void;
  lastMessage: string;
  isDark: boolean;
  title: string;
  loadingText: string;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onSelect,
  onClose,
  lastMessage,
  isDark,
  title,
  loadingText,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const shuffled = [...AI_SUGGESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setSuggestions(shuffled);
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [lastMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mx-6 mb-2 rounded-2xl p-4"
      style={{
        background: "var(--th-accent-wash)",
        border: "1px solid var(--th-accent-border)",
        boxShadow: "0 4px 24px rgb(var(--th-accent-rgb) / 0.18)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[rgb(var(--th-accent-2-rgb))]" />
          <span className="text-xs font-bold text-[var(--th-text)]">
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть подсказки"
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 bg-[var(--th-chip-bg)] hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-[var(--th-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--th-accent-2-rgb))]" />
          <span>{loadingText}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelect(sug)}
              className="text-left text-xs p-2.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer bg-[var(--th-chip-bg)] hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text)]"
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
