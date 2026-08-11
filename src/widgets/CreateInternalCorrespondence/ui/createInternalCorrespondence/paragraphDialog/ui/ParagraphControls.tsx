import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "../../../../lib/utils";
import { formatNum, parseNum } from "../model";

interface IFieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

/** Строка «подпись — контрол» с одинаковой шириной подписи во всех группах. */
export const Field = ({ label, htmlFor, children }: IFieldProps) => (
  <div className="flex items-center gap-3">
    <label
      htmlFor={htmlFor}
      className="w-[108px] flex-shrink-0 text-xs text-slate-600 dark:text-slate-300"
    >
      {label}
    </label>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

interface INumberSpinProps {
  id?: string;
  value: number;
  unit?: string;
  step: number;
  min: number;
  max: number;
  decimals: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * Счётчик со стрелками, как в диалогах Word: значение с единицей измерения,
 * ввод с клавиатуры принимает и запятую, и точку.
 */
export const NumberSpin = ({
  id,
  value,
  unit,
  step,
  min,
  max,
  decimals,
  disabled,
  onChange,
}: INumberSpinProps) => {
  // Пока поле в фокусе, показываем ровно то, что набирает пользователь:
  // форматирование и подстановка единиц происходят на blur, иначе каретка
  // прыгала бы на каждый символ.
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const shown =
    draft ?? `${formatNum(value, decimals)}${unit ? ` ${unit}` : ""}`;

  const commit = () => {
    const parsed = draft === null ? null : parseNum(draft);
    setDraft(null);
    if (parsed !== null) onChange(clamp(parsed));
  };

  const stepBy = (direction: 1 | -1) => {
    setDraft(null);
    onChange(clamp(value + direction * step));
  };

  return (
    <div
      className={cn(
        "flex items-stretch rounded-lg border transition-colors",
        disabled
          ? "border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60"
          : "border-slate-200 bg-white focus-within:border-blue-400 dark:border-zinc-700 dark:bg-zinc-800",
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={shown}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setDraft(formatNum(value, decimals))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "ArrowUp") {
            e.preventDefault();
            stepBy(1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            stepBy(-1);
          }
        }}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-xs tabular-nums focus:outline-none",
          disabled
            ? "cursor-not-allowed text-slate-300 dark:text-zinc-600"
            : "text-slate-700 dark:text-zinc-100",
        )}
      />
      <div className="flex flex-col border-l border-slate-200 dark:border-zinc-700">
        {([1, -1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => stepBy(direction)}
            aria-label={direction === 1 ? "Увеличить" : "Уменьшить"}
            className={cn(
              "flex h-1/2 w-6 items-center justify-center transition-colors",
              direction === 1 && "border-b border-slate-200 dark:border-zinc-700",
              disabled
                ? "cursor-not-allowed text-slate-300 dark:text-zinc-600"
                : "cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100",
            )}
          >
            {direction === 1 ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        ))}
      </div>
    </div>
  );
};

interface IGroupProps {
  title: string;
  children: ReactNode;
}

/** Рамка группы настроек («Общие», «Отступ», «Интервал», «Образец»). */
export const Group = ({ title, children }: IGroupProps) => (
  <fieldset className="rounded-xl border border-slate-200 px-4 pb-4 pt-2 dark:border-zinc-700">
    <legend className="px-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
      {title}
    </legend>
    <div className="space-y-2.5">{children}</div>
  </fieldset>
);
