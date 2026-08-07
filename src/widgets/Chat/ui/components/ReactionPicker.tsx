import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { QUICK_REACTIONS, EMOJI_CATEGORY_EMOJIS } from "../../model";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  isMe: boolean;
  isDark: boolean;
}

const ALL_EMOJIS = EMOJI_CATEGORY_EMOJIS.flat();

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  onClose,
  isMe,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={`absolute ${isExpanded ? "-top-52" : "-top-12"} ${
        isMe ? "right-0" : "left-0"
      } flex flex-col rounded-2xl p-1 z-40 ${
        isDark
          ? "backdrop-blur-2xl bg-zinc-900/95 border border-white/20"
          : "backdrop-blur-2xl bg-white/95 border border-black/10 shadow-xl"
      }`}
      style={{
        boxShadow: isDark
          ? "0 8px 30px rgba(139,92,246,0.4)"
          : "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex items-center gap-0.5">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose?.();
            }}
            className={`w-8 h-8 flex items-center justify-center text-lg rounded-full transition-all duration-150 ease-in-out hover:scale-125 ${
              isDark ? "hover:bg-white/20" : "hover:bg-black/5"
            }`}
          >
            <span>{emoji}</span>
          </button>
        ))}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? "Свернуть" : "Все смайлики"}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 ease-in-out ${
            isDark
              ? "text-white/60 hover:bg-white/20 hover:text-white"
              : "text-gray-500 hover:bg-black/5 hover:text-gray-900"
          }`}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t mt-1 pt-1 border-white/10"
          >
            <div className="grid grid-cols-7 gap-1 p-1 max-h-40 overflow-y-auto max-w-[240px]">
              {ALL_EMOJIS.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => {
                    onSelect(emoji);
                    onClose?.();
                  }}
                  className={`w-7 h-7 flex items-center justify-center text-base rounded-lg transition-all duration-150 ease-in-out hover:scale-120 ${
                    isDark ? "hover:bg-white/20" : "hover:bg-black/5"
                  }`}
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
