import React from "react";
import { motion } from "framer-motion";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { ITimelineEvent } from "../../lib/structure/types";
import { getEventMeta, getInitials, formatTime } from "../../lib/structure/helpers";

interface IEventRowProps {
  event: ITimelineEvent;
  isLast: boolean;
}

export const EventRow: React.FC<IEventRowProps> = ({ event, isLast }) => {
  const meta = getEventMeta(event);
  const Icon = meta.icon;
  const actorName = event.actor?.full_name || "Система";
  const initials = event.actor ? getInitials(actorName) : "С";
  const note = event.data?.decline_reason || event.data?.reason || event.data?.note || event.data?.subject;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 group/event", !isLast && "mb-3")}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 -ml-8 ring-2 ring-white dark:ring-slate-800 relative z-10",
          meta.ring,
        )}
      >
        <Icon size={12} className={meta.iconColor} />
      </div>
      <div className="flex-1 min-w-0 pb-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0",
                !event.actor
                  ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                  : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
              )}
            >
              {initials}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {actorName}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-400">·</span>
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                meta.badge,
              )}
            >
              {meta.badgeText}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 flex-shrink-0 mt-0.5 font-medium">
            {formatTime(event.performed_at)}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
          {meta.title}
        </p>
        <If is={Boolean(note)}>
          <div className="mt-1.5 pl-3 border-l-2 border-amber-200 dark:border-amber-700">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {note}
            </p>
          </div>
        </If>
      </div>
    </motion.div>
  );
};
