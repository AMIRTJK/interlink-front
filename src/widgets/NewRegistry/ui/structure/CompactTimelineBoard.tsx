import React, { RefObject } from "react";
import { motion } from "framer-motion";
import { cn } from "@shared/lib";
import { ICompactTimelineCard, TCompactCardsCount } from "../../lib/structure/compact";
import { EventRow } from "./EventRow";

const GRID_CLASS: Record<TCompactCardsCount, string> = {
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

interface ICompactTimelineBoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  cards: ICompactTimelineCard[];
  cardsCount: TCompactCardsCount;
  fallbackActorName?: string;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
}

export const CompactTimelineBoard: React.FC<ICompactTimelineBoardProps> = ({
  boardRef,
  cards,
  cardsCount,
  fallbackActorName,
  onVersionClick,
}) => (
  <div ref={boardRef} className={cn("grid gap-3", GRID_CLASS[cardsCount])}>
    {cards.map((card) => (
      <motion.div
        key={card.startIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/30 px-3 pt-2.5 pb-3 h-full"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            {card.items.length > 1
              ? `Этапы ${card.startIndex}–${card.startIndex + card.items.length - 1}`
              : `Этап ${card.startIndex}`}
          </span>
          <span className="flex-1 h-px bg-slate-200/70 dark:bg-slate-700/70" />
        </div>

        <div className="relative pl-8">
          <div className="absolute left-[14px] top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-700" />
          {card.items.map((event, index) => (
            <EventRow
              key={event.performed_at + index}
              event={event}
              index={index}
              isLast={index === card.items.length - 1}
              fallbackActorName={fallbackActorName}
              onVersionClick={onVersionClick}
            />
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);
