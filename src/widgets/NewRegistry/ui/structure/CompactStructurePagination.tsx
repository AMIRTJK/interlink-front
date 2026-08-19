import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@shared/lib";

interface ICompactStructurePaginationProps {
  pageIndex: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
}

const NAV_CLASS =
  "w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed";

export const CompactStructurePagination: React.FC<ICompactStructurePaginationProps> = ({
  pageIndex,
  totalPages,
  from,
  to,
  total,
  onPageChange,
}) => {
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === totalPages - 1;

  return (
    <div
      className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
        Этапы {from}–{to} из {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={isFirst}
          aria-label="Предыдущие этапы"
          className={cn(
            NAV_CLASS,
            isFirst
              ? "border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
          )}
        >
          <ChevronLeft size={13} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onPageChange(index)}
            aria-label={`Страница структуры ${index + 1}`}
            aria-current={index === pageIndex}
            className={cn(
              "min-w-[22px] h-6 px-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer border",
              index === pageIndex
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
            )}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={isLast}
          aria-label="Следующие этапы"
          className={cn(
            NAV_CLASS,
            isLast
              ? "border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
          )}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
