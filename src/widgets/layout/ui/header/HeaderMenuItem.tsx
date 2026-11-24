import type { ReactNode } from "react";
import { cn } from "@shared/lib";

interface IProps {
  icon: ReactNode;
  label: string;
  /** Текущее значение справа от подписи: «Вкл», название выбранной темы и т. п. */
  hint?: string;
  isActive?: boolean;
  isDanger?: boolean;
  onClick: () => void;
}

const ROW_CLASS =
  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[1.25rem] text-sm font-semibold text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export const HeaderMenuItem = ({
  icon,
  label,
  hint,
  isActive = false,
  isDanger = false,
  onClick,
}: IProps) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={cn(
      ROW_CLASS,
      isDanger
        ? "text-zinc-700 dark:text-zinc-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700",
    )}
  >
    <span
      className={cn(
        "shrink-0",
        isActive ? "text-[var(--th-accent-text)]" : "text-zinc-500 dark:text-zinc-400",
      )}
    >
      {icon}
    </span>
    <span className="flex-1 truncate">{label}</span>
    {hint && (
      <span
        className={cn(
          "text-xs font-medium shrink-0 capitalize",
          isActive ? "text-[var(--th-accent-text)]" : "text-zinc-400",
        )}
      >
        {hint}
      </span>
    )}
  </button>
);
