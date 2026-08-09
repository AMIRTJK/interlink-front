import React from "react";
import { motion } from "framer-motion";
import { EmptyState, If } from "@shared/ui";
import { useIsDarkMode } from "@shared/lib";
import { useDesignSettings, THEMES } from "@widgets/layout";
import { LetterDirection } from "../../lib/structure/types";
import { groupLettersByDate, pluralizeDocuments } from "../../lib/structure/helpers";
import { LetterActivityCard } from "./LetterActivityCard";

const AnimatedStructureDivider: React.FC = () => {
  const { currentTheme } = useDesignSettings();
  const isDark = useIsDarkMode();
  const theme = THEMES[currentTheme] || THEMES.blue;
  const themeColor = isDark ? (theme.dark || "#0A84FF") : (theme.light || "#007AFF");

  return (
    <div className="flex-1 h-[2px] bg-slate-200/50 dark:bg-slate-700/50 relative overflow-hidden rounded-full my-auto">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
        className="absolute top-0 bottom-0 w-1/2 rounded-full pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${themeColor} 50%, transparent 100%)`,
          boxShadow: `0 0 10px ${themeColor}`,
        }}
      />
    </div>
  );
};

interface IStructureViewProps {
  documents: any[];
  direction: LetterDirection;
  onCardClick: (id: number) => void;
  onVersionClick?: (docId: number, versionId?: number, versionNum?: string) => void;
  highlightedId?: string | number | null;
}

export const StructureView: React.FC<IStructureViewProps> = ({
  documents,
  direction,
  onCardClick,
  onVersionClick,
  highlightedId,
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
                <AnimatedStructureDivider />
              </div>

              <div className="space-y-4">
                {group.items.map((item, index) => (
                  <LetterActivityCard
                    key={item.id}
                    item={item}
                    direction={direction}
                    index={index}
                    onClick={() => onCardClick(item.id)}
                    onVersionClick={onVersionClick}
                    isHighlighted={Boolean(highlightedId && String(item.id) === String(highlightedId))}
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
