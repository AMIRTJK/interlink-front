import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { If } from "@shared/ui";
import {
  LetterDirection,
  IRelatedDocumentLink,
  IStructureLetterRef,
  ITimelineEvent,
} from "../../lib/structure/types";
import { getPageBounds, splitEventsIntoCards } from "../../lib/structure/compact";
import {
  useCompactStructureSettings,
  useTimelineCardCapacity,
  useTimelineRowHeights,
} from "../../lib/structure/useCompactStructure";
import { EventRow } from "./EventRow";
import { RelatedDocsSection } from "./RelatedDocsSection";
import { CompactStructureControls } from "./CompactStructureControls";
import { CompactStructurePagination } from "./CompactStructurePagination";
import { CompactTimelineBoard } from "./CompactTimelineBoard";

interface IStructureTimelinePanelProps {
  item: IStructureLetterRef;
  direction: LetterDirection;
  timelineEvents: ITimelineEvent[];
  relatedDocs: IRelatedDocumentLink[];
  creatorName: string;
  onClick: () => void;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
}

export const StructureTimelinePanel: React.FC<IStructureTimelinePanelProps> = ({
  item,
  direction,
  timelineEvents,
  relatedDocs,
  creatorName,
  onClick,
  onVersionClick,
}) => {
  const { isCompact, cardsCount, setCompact, setCardsCount } = useCompactStructureSettings();
  const boardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const itemsPerCard = useTimelineCardCapacity({
    boardRef,
    footerRef,
    isActive: isCompact,
    resetKey: `${cardsCount}-${timelineEvents.length}-${page}`,
  });

  const rowHeights = useTimelineRowHeights({
    boardRef,
    offset: getPageBounds(timelineEvents.length, cardsCount, itemsPerCard, page).offset,
    isActive: isCompact,
  });

  const { cards, totalPages, pageIndex, from, to } = useMemo(
    () => splitEventsIntoCards(timelineEvents, cardsCount, itemsPerCard, page, rowHeights),
    [timelineEvents, cardsCount, itemsPerCard, page, rowHeights],
  );

  useEffect(() => {
    if (page !== pageIndex) setPage(pageIndex);
  }, [page, pageIndex]);

  const currentDoc = useMemo(
    () => ({
      id: item.id,
      kind: item.kind || direction,
      date: item.sent_at || item.created_at || undefined,
      reg_number: item.reg_number || undefined,
      subject: item.subject,
    }),
    [item.id, item.kind, item.sent_at, item.created_at, item.reg_number, item.subject, direction],
  );

  const relatedDocsNode = (
    <RelatedDocsSection
      relatedDocuments={relatedDocs}
      currentDoc={currentDoc}
      onDocClick={onClick}
    />
  );

  return (
    <div>
      <CompactStructureControls
        isCompact={isCompact}
        cardsCount={cardsCount}
        itemsPerCard={itemsPerCard}
        totalEvents={timelineEvents.length}
        onCompactChange={setCompact}
        onCardsCountChange={setCardsCount}
      />

      <If is={isCompact}>
        <CompactTimelineBoard
          boardRef={boardRef}
          cards={cards}
          cardsCount={cardsCount}
          fallbackActorName={creatorName}
          onVersionClick={onVersionClick}
        />
        <div ref={footerRef}>
          <If is={totalPages > 1}>
            <CompactStructurePagination
              pageIndex={pageIndex}
              totalPages={totalPages}
              from={from}
              to={to}
              total={timelineEvents.length}
              onPageChange={setPage}
            />
          </If>
          {relatedDocsNode}
        </div>
      </If>

      <If is={!isCompact}>
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
          {relatedDocsNode}
        </motion.div>
      </If>
    </div>
  );
};
