import type { ReactNode } from "react";
import { cn } from "@shared/lib";

interface IProps {
  label: string;
  hint?: string;
  icon?: ReactNode;
  isChecked: boolean;
  isMuted?: boolean;
  onToggle: () => void;
}

export const NewYearSwitchRow = ({ label, hint, icon, isChecked, isMuted = false, onToggle }: IProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={isChecked}
    onClick={onToggle}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-[1.25rem] text-left transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-th-high focus:outline-none focus-visible:ring-2 focus-visible:ring-th-accent-400",
      isMuted && "opacity-60",
    )}
  >
    {icon && <span className="shrink-0 text-zinc-500 dark:text-zinc-400">{icon}</span>}
    <span className="flex-1 min-w-0">
      <span className="block truncate text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {label}
      </span>
      {hint && (
        <span className="block truncate text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>
      )}
    </span>
    <span
      aria-hidden="true"
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        isChecked ? "bg-sky-500" : "bg-zinc-300 dark:bg-th-higher",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          isChecked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </span>
  </button>
);
