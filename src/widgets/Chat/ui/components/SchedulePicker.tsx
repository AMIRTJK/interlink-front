import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

interface ScheduleOption {
  label: string;
  offset: number;
}

interface SchedulePickerProps {
  options: ScheduleOption[];
  title: string;
  onSchedule: (label: string, offset: number) => void;
  onClose: () => void;
  isDark: boolean;
}

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  options,
  title,
  onSchedule,
  onClose,
  isDark,
}) => {
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
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.16 }}
      className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl shadow-2xl overflow-hidden z-40 backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
      style={{ boxShadow: "0 8px 40px rgb(var(--th-accent-rgb) / 0.25)" }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2 border-[var(--th-divider)]"
      >
        <Clock3
          className="w-4 h-4 text-[var(--th-accent-text)]"
        />
        <span
          className="text-xs font-semibold text-[var(--th-text)]"
        >
          {title}
        </span>
      </div>
      <div className="py-1">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => {
              onSchedule(opt.label, opt.offset);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all duration-200 ease-in-out text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)] hover:text-[var(--th-text)]"
          >
            <Clock3
              className="w-3.5 h-3.5 text-[var(--th-accent-text)]"
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
