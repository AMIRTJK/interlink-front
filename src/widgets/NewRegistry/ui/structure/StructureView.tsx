import React from "react";
import { EmptyState, If } from "@shared/ui";
import { LetterDirection } from "../../lib/structure/types";
import { groupLettersByDate, pluralizeDocuments } from "../../lib/structure/helpers";
import { LetterActivityCard } from "./LetterActivityCard";

interface IStructureViewProps {
  documents: any[];
  direction: LetterDirection;
  onCardClick: (id: number) => void;
}

export const StructureView: React.FC<IStructureViewProps> = ({
  documents,
  direction,
  onCardClick,
}) => {
  const hasDocs = Boolean(documents && documents.length > 0);

  return (
    <div>
      <If is={!hasDocs}>
        <EmptyState />
      </If>
      <If is={hasDocs}>
        <div className="space-y-8">
          {groupLettersByDate(documents).map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-[0.12em]">
                    {group.label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                    {group.items.length} {pluralizeDocuments(group.items.length)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              </div>

              <div className="space-y-4">
                {group.items.map((item, index) => (
                  <LetterActivityCard
                    key={item.id}
                    item={item}
                    direction={direction}
                    index={index}
                    onClick={() => onCardClick(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </If>
    </div>
  );
};
