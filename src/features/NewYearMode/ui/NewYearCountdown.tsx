import { useEffect, useState } from "react";
import { TreePine } from "lucide-react";
import { cn } from "@shared/lib";
import { getNewYearCountdown, padTime } from "../lib/countdown";

interface IProps {
  isBottomNav: boolean;
}

// По центру снизу: углы заняты боковым меню и плавающей кнопкой чата.

const TICK_MS = 1000;

export const NewYearCountdown = ({ isBottomNav }: IProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timerId);
  }, []);

  const countdown = getNewYearCountdown(now);

  return (
    <div
      role="status"
      aria-live="off"
      className={cn(
        "pointer-events-none fixed left-1/2 -translate-x-1/2 z-[85] flex items-center gap-2.5 rounded-[2.5rem] border border-white/30 bg-white/60 px-4 py-2 shadow-lg backdrop-blur-xl dark:border-zinc-700/40 dark:bg-zinc-900/60",
        isBottomNav ? "bottom-24" : "bottom-4",
      )}
    >
      <TreePine size={18} strokeWidth={2.2} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
      {countdown.kind === "greeting" ? (
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          С Новым {countdown.year} годом!
        </span>
      ) : (
        <span className="flex items-baseline gap-1.5 text-zinc-800 dark:text-zinc-100">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            До {countdown.year}:
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {countdown.days} дн {padTime(countdown.hours)}:{padTime(countdown.minutes)}:
            {padTime(countdown.seconds)}
          </span>
        </span>
      )}
    </div>
  );
};
