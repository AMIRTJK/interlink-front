import * as React from "react";
import { T } from "../../theme/tokens";

interface IProps {
  statChips: {
    label: string;
    value: number;
    dot: string | null;
  }[];
}

export function UsersViewStatChips({ statChips }: IProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statChips.map((chip) => (
        <div
          key={chip.label}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1 shadow-xs"
        >
          {chip.dot && (
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: chip.dot }}
            />
          )}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {chip.label}
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {chip.value}
          </span>
        </div>
      ))}
    </div>
  );
}
