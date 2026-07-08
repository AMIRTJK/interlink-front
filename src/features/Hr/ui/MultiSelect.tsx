import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { If } from "@shared/ui";

interface IOption {
  value: string;
  label: string;
}

interface IMultiSelectProps {
  value?: string[];
  onChange?: (v: string[]) => void;
  options: IOption[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

const getInputClasses = (hasError?: boolean, disabled?: boolean) => {
  const inputShell = "w-full rounded-xl border text-sm outline-none transition-colors";
  if (disabled) return `${inputShell} border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-gray-400 dark:text-slate-600 cursor-not-allowed`;
  if (hasError) return `${inputShell} border-red-300 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10 text-gray-800 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
  return `${inputShell} border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20`;
};

export const MultiSelect = ({ value, onChange, options, placeholder, disabled, hasError }: IMultiSelectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = value || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) => {
    onChange?.(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  const chosen = options.filter((o) => selected.includes(o.value));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${getInputClasses(hasError, disabled)} min-h-[44px] pl-3 pr-9 py-1.5 flex items-center gap-1.5 flex-wrap text-left cursor-pointer`}
      >
        {chosen.length === 0 ? (
          <span className="text-gray-400 dark:text-slate-600">{placeholder}</span>
        ) : (
          chosen.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-0.5 text-xs"
            >
              {o.label}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(o.value);
                }}
                className="hover:text-indigo-900 dark:hover:text-indigo-100 flex"
              >
                <X size={11} />
              </span>
            </span>
          ))
        )}
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-600 pointer-events-none"
        />
      </button>
      <If is={open}>
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-slate-600">Нет данных</p>
          ) : (
            options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      on ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 dark:border-slate-700"
                    }`}
                  >
                    <If is={on}>
                      <Check size={11} />
                    </If>
                  </span>
                  <span className="text-gray-700 dark:text-slate-300">{o.label}</span>
                </button>
              );
            })
          )}
        </div>
      </If>
    </div>
  );
};
