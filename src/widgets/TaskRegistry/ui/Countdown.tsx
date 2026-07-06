import { useState, useEffect } from "react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { getCountdown } from "../lib/helpers";

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

  if (t.type === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-[11px] font-bold uppercase tracking-wider border border-red-200 dark:border-red-800 animate-pulse">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        Просрочено
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold text-sm tabular-nums tracking-tight",
        t.type === "urgent" ? "text-amber-600" : "text-emerald-600",
      )}
    >
      {t.days}д {t.hours}ч {t.minutes}м {t.seconds}с
    </span>
  );
};
