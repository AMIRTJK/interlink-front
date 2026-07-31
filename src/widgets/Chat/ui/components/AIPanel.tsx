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
        background: isDark
          ? "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.15),rgba(6,182,212,0.15))"
          : "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.08),rgba(6,182,212,0.08))",
        border: isDark
          ? "1px solid rgba(167,139,250,0.3)"
          : "1px solid rgba(124,58,237,0.25)",
        boxShadow: isDark
          ? "0 4px 24px rgba(139,92,246,0.2)"
          : "0 4px 24px rgba(124,58,237,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles
            className={`w-4 h-4 ${isDark ? "text-fuchsia-300" : "text-fuchsia-600"}`}
          />
          <span
            className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-800"}`}
          >
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "bg-white/10 hover:bg-white/20 text-white/60" : "bg-black/5 hover:bg-black/10 text-gray-500"}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-white/50">
          <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
          <span>{loadingText}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelect(sug)}
              className={`text-left text-xs p-2.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${isDark ? "bg-white/8 hover:bg-white/18 text-white/85" : "bg-white/60 hover:bg-white text-gray-700 shadow-xs"}`}
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
