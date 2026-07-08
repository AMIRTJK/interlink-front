import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { If } from "@shared/ui";
import { getInputClasses } from "../lib";

interface IOption {
  value: string;
  label: string;
}

interface ICustomSelectProps {
  value?: string;
  onChange?: (v: string | undefined) => void;
  options: IOption[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  allowClear,
  disabled,
  hasError,
}: ICustomSelectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string | undefined) => {
    onChange?.(val);
    setOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${getInputClasses(hasError, disabled)} h-11 pl-3 pr-9 flex items-center justify-between text-left cursor-pointer`}
      >
        <span className={selectedOption ? "text-gray-800 dark:text-slate-200" : "text-gray-400 dark:text-slate-600"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-600 pointer-events-none"
        />
      </button>

      <If is={open}>
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1">
          <If is={allowClear}>
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
            >
              — Не выбрано —
            </button>
          </If>
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-slate-600">Нет данных</p>
          ) : (
            options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center justify-between ${
                    active ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/30 dark:bg-indigo-950/20" : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  <span>{o.label}</span>
                  <If is={active}>
                    <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </If>
                </button>
              );
            })
          )}
        </div>
      </If>
    </div>
  );
};
