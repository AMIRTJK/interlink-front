import { memo } from "react";

export interface ISegmentOption {
  value: number;
  label: string;
}

interface IProps {
  label: string;
  value: number;
  options: ISegmentOption[];
  onChange: (value: number) => void;
}

const TRACK =
  "flex items-center gap-0.5 p-0.5 rounded-full ui-glass-soft bg-slate-100 dark:bg-th-raised/90 border border-zinc-200 dark:border-th-high/50";
const ITEM =
  "px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer transition-[color] duration-150 tabular-nums";
const ITEM_ACTIVE = "bg-th-accent-600 text-white shadow-sm";
const ITEM_IDLE =
  "bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100";

/** Выбор из нескольких значений одной строкой — все варианты видны сразу. */
export const AnalyticsSegment = memo(({ label, value, options, onChange }: IProps) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</span>
    <div role="radiogroup" aria-label={label} className={TRACK}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`${ITEM} ${isActive ? ITEM_ACTIVE : ITEM_IDLE}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
));
