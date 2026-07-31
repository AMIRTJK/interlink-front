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
      className={`absolute bottom-full right-0 mb-3 w-56 rounded-2xl shadow-2xl overflow-hidden z-40 ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "bg-white border border-black/8 shadow-xl"}`}
      style={{
        boxShadow: isDark
          ? "0 8px 40px rgba(139,92,246,0.3)"
          : "0 8px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <Clock3
          className={`w-4 h-4 ${isDark ? "text-violet-300" : "text-violet-650"}`}
        />
        <span
          className={`text-xs font-semibold ${isDark ? "text-white/90" : "text-gray-800"}`}
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
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all duration-200 ease-in-out ${isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-black/5 hover:text-gray-900"}`}
          >
            <Clock3
              className={`w-3.5 h-3.5 ${isDark ? "text-violet-300" : "text-violet-605"}`}
            />
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
