import { useState, useEffect } from "react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { getCountdown, getFullCountdown } from "../lib/helpers";

/** Компактный обратный отсчёт (обновление раз в минуту). */
export const CountdownTimer = ({ dueDate }: { dueDate: string }) => {
  const [timer, setTimer] = useState(getCountdown(dueDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getCountdown(dueDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  return (
    <If is={timer.type !== "overdue"}>
      <span
        className={cn(
          "font-medium text-sm",
          timer.type === "urgent" ? "text-amber-600" : "text-emerald-600",
        )}
      >
        {timer.text}
      </span>
    </If>
  );
};

/** Живой обратный отсчёт с секундами (обновление раз в секунду). */
export const LiveCountdown = ({ dueDate }: { dueDate: string }) => {
  const [t, setT] = useState(() => getFullCountdown(dueDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setT(getFullCountdown(dueDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [dueDate]);

  const isOverdue = t.type === "overdue";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 rounded-full border text-[11px] font-bold tracking-tight tabular-nums shadow-xs whitespace-nowrap",
        isOverdue
          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400"
          : t.type === "urgent"
            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400"
            : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400",
      )}
    >
      {t.text}
    </span>
  );
};
