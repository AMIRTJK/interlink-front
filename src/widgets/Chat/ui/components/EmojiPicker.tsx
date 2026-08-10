import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { EmojiCategory } from "../../model";

interface EmojiPickerProps {
  categories: EmojiCategory[];
  onSelect: (e: string) => void;
  onClose: () => void;
  isDark: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  categories,
  onSelect,
  onClose,
  isDark,
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full left-0 mb-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-40 backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
      style={{ boxShadow: "0 8px 40px rgb(var(--th-accent-rgb) / 0.25)" }}
    >
      <div className="flex px-2 pt-2 gap-1 border-b border-[var(--th-divider)]">
        {categories.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            className={`flex-1 text-[10px] font-medium pb-2 border-b-2 transition-all duration-200 ease-in-out ${activeCategory === i ? "border-[rgb(var(--th-accent-rgb))] text-[var(--th-accent-text)]" : "border-transparent text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="p-3 grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
        {categories[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-all duration-150 ease-in-out hover:scale-125 hover:bg-[var(--th-hover-bg-strong)]"
          >
            <span>{emoji}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
