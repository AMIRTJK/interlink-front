import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface IProps {
  value: number;
  options: readonly number[];
  onChange: (value: number) => void;
}

// Кастомный селект количества строк на странице
export const PageSizeSelect = ({ value, options, onChange }: IProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 font-medium text-slate-600 transition-colors cursor-pointer ${
          open ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:bg-slate-50"
        }`}
      >
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full right-0 z-20 mb-2 min-w-[100px] overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-xl shadow-slate-900/5"
          >
            {options.map((size) => {
              const active = size === value;
              return (
                <li key={size}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(size);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left font-medium transition-colors cursor-pointer ${
                      active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{size}</span>
                    {active && <Check size={14} className="text-blue-500" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
