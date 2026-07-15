import React from "react";
import { cn } from "../lib/utils";

export const TBtn = ({
  onMouseDown,
  title,
  children,
  active,
  disabled,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) => (
  <button
    onMouseDown={onMouseDown}
    title={title}
    disabled={disabled}
    className={cn(
      "p-1.5 rounded transition-colors flex-shrink-0",
      disabled
        ? "text-slate-300 cursor-not-allowed"
        : active
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-slate-100 text-slate-500 hover:text-slate-800",
    )}
  >
    {children}
  </button>
);
