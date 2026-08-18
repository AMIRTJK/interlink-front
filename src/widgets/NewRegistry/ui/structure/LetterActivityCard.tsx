import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronDown, Pin, User, Loader2 } from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { cn, useGetQuery } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import { HighlightOverlay } from "../registryLayout/HighlightOverlay";
import { LetterDirection, IInternalStructureResponse } from "../../lib/structure/types";
import {
  getInitials,
  formatDate,
  getStructureCount,
  filterTimelineEvents,
} from "../../lib/structure/helpers";
import { EventRow } from "./EventRow";
import { RelatedDocsSection } from "./RelatedDocsSection";

const STORAGE_KEY = "correspondence_open_structures";

interface ILetterActivityCardProps {
  item: any;
  direction: LetterDirection;
  index: number;
  onClick: () => void;
  isHighlighted?: boolean;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
}

export const LetterActivityCard: React.FC<ILetterActivityCardProps> = ({
  item,
  direction,
  index,
  onClick,
  isHighlighted,
  onVersionClick,
}) => {
  const [requested, setRequested] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || !item?.id) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed[item.id] || parsed[String(item.id)]);
    } catch {
      return false;
    }
  });

  const [open, setOpen] = useState<boolean>(false);

  const { data: responseData, isLoading } = useGetQuery<
    Record<string, unknown>,
    { data: IInternalStructureResponse }
  >({
    url: requested && item.id ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(item.id)) : undefined,
    options: {
      staleTime: 0,
      refetchOnMount: true,
    },
  });

  useEffect(() => {
    if (requested && !isLoading && responseData?.data) {
      setOpen(true);
    }
  }, [requested, isLoading, responseData]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item?.id) return;

    if (open || (requested && isLoading)) {
      setOpen(false);
      setRequested(false);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        delete parsed[String(item.id)];
        delete parsed[item.id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.error(err);
      }
    } else {
      setRequested(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed[String(item.id)] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isPendingLoad = requested && isLoading && !responseData?.data;

  const structureData = responseData?.data;
  const rawTimeline = structureData?.timeline;
  const timelineEvents = useMemo(
    () => filterTimelineEvents(rawTimeline),
    [rawTimeline],
  );
  const relatedDocs = structureData?.related_documents || [];
  const creatorName = item.creator?.full_name || structureData?.document?.creator?.full_name || "—";
  const primaryRecipient =
    item.recipients?.find((r: any) => r.type === "to")?.user?.full_name ||
    item.recipients?.[0]?.user?.full_name;
  const isUnread = Boolean(item.is_unread);
  // Счётчик этапов виден сразу, до раскрытия: значение приходит вместе с
  // письмом (structure_count). После загрузки структуры уточняем его длиной
  // отфильтрованного timeline.
  const countFromItem = getStructureCount(item);
  const fetchedCount = rawTimeline ? timelineEvents.length : undefined;

  const [lastCount, setLastCount] = useState<number | undefined>(countFromItem);

  useEffect(() => {
    if (typeof fetchedCount === "number") {
      setLastCount(fetchedCount);
    } else if (typeof countFromItem === "number") {
      setLastCount(countFromItem);
    }
  }, [fetchedCount, countFromItem]);

  const displayCount = lastCount ?? countFromItem;
  const hasCount = displayCount !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="group"
    >
      <div className="ui-glass rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-blue-200 dark:hover:border-slate-600 relative overflow-hidden">
        <HighlightOverlay isHighlighted={Boolean(isHighlighted)} rounded="xl" />
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className="mt-1 w-5 h-5 flex items-center justify-center flex-shrink-0">
            <If is={isUnread}>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </If>
            <If is={!isUnread}>
              <span className="w-2 h-2 rounded-full border-2 border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </If>
          </span>

          <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(creatorName)}
            </div>
          </div>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/80 px-2 py-0.5 rounded-md whitespace-nowrap">
                  № {item.id}
                </span>
                <span
                  className={cn(
                    "text-sm text-slate-900 dark:text-slate-100",
                    isUnread ? "font-bold" : "font-semibold text-slate-700 dark:text-slate-200",
                  )}
                >
                  {creatorName}
                </span>
                <If is={Boolean(item.is_pinned)}>
                  <Pin size={11} className="text-blue-500 fill-blue-500 flex-shrink-0" />
                </If>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                  {item.reg_number || structureData?.document?.reg_number || "Без номера"}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-400 flex-shrink-0">
                {formatDate(item.created_at || structureData?.document?.created_at)}
              </span>
            </div>
            <p
              className={cn(
                "text-sm leading-snug",
                isUnread ? "font-medium text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300",
              )}
            >
              {item.subject || structureData?.document?.subject || "Без темы"}
            </p>
            <If is={Boolean(primaryRecipient)}>
              <div className="flex items-center gap-1.5 mt-1.5">
                <User size={11} className="text-slate-400 dark:text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {primaryRecipient}
                </span>
              </div>
            </If>
          </div>

          <Tooltip
            title={
              isPendingLoad
                ? "Загрузка структуры..."
                : hasCount
                  ? `Этапов структуры: ${displayCount}`
                  : "Структура письма"
            }
          >
          <motion.button
            type="button"
            onClick={handleToggle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 mt-0.5 cursor-pointer select-none border",
              open
                ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                : isPendingLoad
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/80 shadow-xs"
                  : "text-slate-400 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200",
            )}
            aria-label="Показать структуру письма"
          >
            <If is={isPendingLoad}>
              <Loader2 size={12} className="animate-spin text-blue-500" />
            </If>
            <If is={!isPendingLoad}>
              <Activity size={12} />
            </If>
            <If is={hasCount}>
              <span>{displayCount}</span>
            </If>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            >
              <ChevronDown size={12} />
            </motion.div>
          </motion.button>
          </Tooltip>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="timeline"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { type: "spring", stiffness: 520, damping: 36, mass: 0.5 },
                  opacity: { duration: 0.15 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { type: "spring", stiffness: 550, damping: 38, mass: 0.5 },
                  opacity: { duration: 0.12 },
                },
              }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <div>
                  <div className="relative pl-8">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="absolute left-[14px] top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-700 origin-top"
                    />
                    {timelineEvents.map((event, i) => (
                      <EventRow
                        key={event.performed_at + i}
                        event={event}
                        index={i}
                        isLast={i === timelineEvents.length - 1}
                        fallbackActorName={creatorName}
                        onVersionClick={onVersionClick}
                      />
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <RelatedDocsSection
                      relatedDocuments={relatedDocs}
                      currentDoc={{
                        id: item.id,
                        kind: item.kind || direction,
                        date: item.sent_at || item.created_at,
                        reg_number: item.reg_number,
                        subject: item.subject,
                      }}
                      onDocClick={(_id) => onClick()}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

