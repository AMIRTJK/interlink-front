import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { ITimelineEvent } from "../../lib/structure/types";
import { getEventMeta, getInitials, formatDateTime } from "../../lib/structure/helpers";
import { TIMELINE_ROW_MARKER } from "../../lib/structure/compact";

interface IEventRowProps {
  event: ITimelineEvent;
  isLast: boolean;
  index?: number;
  fallbackActorName?: string;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
}

export const EventRow: React.FC<IEventRowProps> = ({
  event,
  isLast,
  index = 0,
  fallbackActorName,
  onVersionClick,
}) => {
  const meta = getEventMeta(event);
  const Icon = meta.icon;
  const rawActorName = event.actor?.full_name;
  const actorName =
    rawActorName ||
    (fallbackActorName && fallbackActorName !== "—"
      ? fallbackActorName
      : "Система");
  const hasKnownActor = Boolean(rawActorName || (fallbackActorName && fallbackActorName !== "—"));
  const initials = getInitials(actorName);
  const isCommentEvent =
    event.type === "comment_created" || event.action === "comment_created";
  const note =
    event.data?.decline_reason ||
    event.data?.reason ||
    event.data?.note ||
    (isCommentEvent ? event.data?.text : undefined);

  const targetVersionId = event.version_id || event.data?.version_id;
  const targetVersionNum = event.data?.version ? String(event.data.version) : undefined;
  const isVersionEvent = Boolean(
    (event.type === "version_created" ||
      event.action === "version_created" ||
      event.type === "version_selected_for_signature" ||
      event.type === "version_selected" ||
      event.action === "version_selected_for_signing" ||
      event.action === "version_selected") &&
      (targetVersionId || targetVersionNum)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex gap-3 group/event", !isLast && "mb-3")}
      {...TIMELINE_ROW_MARKER}
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
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0",
              !hasKnownActor
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
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5",
              meta.badge,
            )}
          >
            {meta.badgeText}
          </span>
          <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
          <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-400 flex-shrink-0">
            {formatDateTime(event.performed_at)}
          </span>
        </div>
        <If is={isVersionEvent}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVersionClick?.(event.document_id, targetVersionId, targetVersionNum);
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer inline-flex items-center gap-1 mt-0.5 text-left group/vlink"
            title="Открыть эту версию письма"
          >
            <span>{meta.title}</span>
            <ExternalLink size={11} className="opacity-70 group-hover/vlink:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        </If>
        <If is={!isVersionEvent}>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
            {meta.title}
          </p>
        </If>
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
