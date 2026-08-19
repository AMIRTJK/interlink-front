import React from "react";
import { Check, LayoutGrid } from "lucide-react";
import { cn } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import { COMPACT_CARDS_OPTIONS, TCompactCardsCount } from "../../lib/structure/compact";

interface ICompactStructureControlsProps {
  isCompact: boolean;
  cardsCount: TCompactCardsCount;
  itemsPerCard: number;
  totalEvents: number;
  onCompactChange: (value: boolean) => void;
  onCardsCountChange: (value: TCompactCardsCount) => void;
}

export const CompactStructureControls: React.FC<ICompactStructureControlsProps> = ({
  isCompact,
  cardsCount,
  itemsPerCard,
  totalEvents,
  onCompactChange,
  onCardsCountChange,
}) => (
  <div
    className="flex items-center justify-between gap-3 flex-wrap mb-3"
    onClick={(e) => e.stopPropagation()}
  >
    <label className="inline-flex items-center gap-2 cursor-pointer select-none group/compact">
      <span className="relative flex items-center justify-center w-4 h-4">
        <input
          type="checkbox"
          checked={isCompact}
          onChange={(e) => onCompactChange(e.target.checked)}
          className="peer absolute inset-0 opacity-0 cursor-pointer"
        />
        <span
          className={cn(
            "w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400/60",
            isCompact
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/compact:border-blue-400",
          )}
        >
          <If is={isCompact}>
            <Check size={11} className="stroke-[3]" />
          </If>
        </span>
      </span>
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        Компактное отображение
      </span>
      <span className="text-[11px] text-slate-400 dark:text-slate-500">
        · этапов: {totalEvents}
      </span>
    </label>

    <If is={isCompact}>
      <div className="flex items-center gap-2">
        <LayoutGrid size={12} className="text-slate-400 dark:text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Карточек:
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
          {COMPACT_CARDS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onCardsCountChange(option)}
              aria-label={`Разделить структуру на ${option} карточки`}
              aria-pressed={option === cardsCount}
              className={cn(
                "min-w-[26px] h-[22px] px-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                option === cardsCount
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <Tooltip title="Количество этапов на карточке подбирается под высоту экрана">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
            до {itemsPerCard} на карточку
          </span>
        </Tooltip>
      </div>
    </If>
  </div>
);
