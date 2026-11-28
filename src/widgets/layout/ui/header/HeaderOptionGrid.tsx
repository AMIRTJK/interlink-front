import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@shared/lib";

export interface IHeaderOption {
  key: string;
  label: string;
  /** Превью варианта: цветной кружок, иконка раскладки и т. п. */
  preview: ReactNode;
}

interface IProps {
  options: IHeaderOption[];
  value?: string;
  onSelect: (key: string) => void;
  columns?: 3 | 4;
}

const GRID_COLUMNS: Record<3 | 4, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/**
 * Компактная сетка вариантов для меню шапки. В отличие от вертикального списка,
 * дюжина тем помещается в окно без прокрутки, а новые варианты добавляют строку,
 * а не уводят окно за край экрана.
 */
export const HeaderOptionGrid = ({
  options,
  value,
  onSelect,
  columns = 4,
}: IProps) => (
  <div role="radiogroup" className={cn("grid gap-1 px-1 pb-1", GRID_COLUMNS[columns])}>
    {options.map((option) => {
      const isSelected = option.key === value;
      return (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={isSelected}
          onClick={() => onSelect(option.key)}
          className={cn(
            "flex flex-col items-center gap-1.5 px-1 py-2 rounded-[1.25rem] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-th-accent-400",
            isSelected
              ? "bg-zinc-100 dark:bg-th-high"
              : "hover:bg-zinc-100 dark:hover:bg-th-high",
          )}
        >
          <span className="relative">
            {option.preview}
            {isSelected && (
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-th-raised">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
          </span>
          <span className="w-full truncate text-center text-[11px] font-semibold capitalize text-zinc-600 dark:text-zinc-300">
            {option.label}
          </span>
        </button>
      );
    })}
  </div>
);
