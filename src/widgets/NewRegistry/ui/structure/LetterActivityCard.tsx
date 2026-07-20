import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronDown, Pin, User, Loader2 } from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { cn, useGetQuery } from "@shared/lib";
import { If } from "@shared/ui";
import { LetterDirection, IInternalStructureResponse } from "../../lib/structure/types";
import { getInitials, formatDate } from "../../lib/structure/helpers";
import { EventRow } from "./EventRow";
import { RelatedDocsSection } from "./RelatedDocsSection";

interface ILetterActivityCardProps {
  item: any;
  direction: LetterDirection;
  index: number;
  onClick: () => void;
}

export const LetterActivityCard: React.FC<ILetterActivityCardProps> = ({
  item,
  index,
  onClick,
}) => {
  const [open, setOpen] = useState(false);

  const { data: responseData, isLoading } = useGetQuery<
    Record<string, unknown>,
    { data: IInternalStructureResponse }
  >({
    url: open && item.id ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(item.id)) : undefined,
  });

  const structureData = responseData?.data;
  const timelineEvents = structureData?.timeline || [];
  const relatedDocs = structureData?.related_documents || [];

  const creatorName = item.creator?.full_name || structureData?.document?.creator?.full_name || "—";
  const primaryRecipient =
    item.recipients?.find((r: any) => r.type === "to")?.user?.full_name ||
    item.recipients?.[0]?.user?.full_name;
  const isUnread = Boolean(item.is_unread);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="group"
    >
      <div className="rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-blue-200 dark:hover:border-slate-600">
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 mt-0.5 cursor-pointer",
              open
                ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                : "text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200",
            )}
            aria-label="Показать структуру письма"
          >
            <Activity size={12} />
            <If is={isLoading}>
              <Loader2 size={12} className="animate-spin text-blue-500" />
            </If>
            <If is={!isLoading}>
              <span>{timelineEvents.length}</span>
            </If>
            <motion.div animate={{ rotate: open ? 180 : 0 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          <If is={open}>
            <motion.div
              key="timeline"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <If is={isLoading}>
                  <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin mr-2 text-blue-500" /> Загрузка структуры...
                  </div>
                </If>
                <If is={!isLoading}>
                  <div className="relative pl-8">
                    <div className="absolute left-[14px] top-0 bottom-4 w-px bg-slate-100 dark:bg-slate-700" />
                    {timelineEvents.map((event, i) => (
                      <EventRow
                        key={event.performed_at + i}
                        event={event}
                        isLast={i === timelineEvents.length - 1}
                      />
                    ))}
                  </div>
                  <RelatedDocsSection
                    relatedDocuments={relatedDocs}
                    onDocClick={() => onClick()}
                  />
                </If>
              </div>
            </motion.div>
          </If>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
