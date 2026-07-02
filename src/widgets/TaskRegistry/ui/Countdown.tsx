import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@shared/lib";
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

  if (timer.type === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold animate-pulse border border-red-200 uppercase tracking-wider">
        <X size={12} strokeWidth={3} /> {timer.text}
      </span>
    );
  }
  if (timer.type === "urgent") {
    return <span className="text-amber-600 font-medium text-sm">{timer.text}</span>;
  }
  return <span className="text-emerald-600 font-medium text-sm">{timer.text}</span>;
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
