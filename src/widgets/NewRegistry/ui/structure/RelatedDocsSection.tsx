import React from "react";
import { Link2, ArrowRight } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { IRelatedDocumentLink } from "../../lib/structure/types";
import { buildRelatedChain } from "@widgets/CreateInternalCorrespondence/ui/RelatedDocsBlock";

interface IRelatedDocsSectionProps {
  relatedDocuments?: IRelatedDocumentLink[];
  currentDoc?: {
    id?: number | string;
    kind?: "incoming" | "outgoing" | string;
    date?: string;
    reg_number?: string;
    subject?: string;
  };
  onDocClick?: (id: number, kind?: string) => void;
}

export const RelatedDocsSection: React.FC<IRelatedDocsSectionProps> = ({
  relatedDocuments,
  currentDoc,
  onDocClick,
}) => {
  const chain = buildRelatedChain(relatedDocuments, currentDoc);

  if (chain.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <Link2 size={14} className="text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Связанные документы ({chain.length})
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {chain.map((item, index) => {
          const isCurrent = item.isCurrent;

          return (
            <React.Fragment key={`${item.kind}-${item.id}`}>
              {index > 0 && (
                <ArrowRight
                  size={16}
                  className="text-slate-300 dark:text-slate-600 flex-shrink-0 mx-0.5"
                />
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onDocClick?.(item.id, item.kind);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border flex-shrink-0 cursor-pointer transition-all shadow-2xs select-none min-w-[190px] max-w-[280px]",
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900/60 shadow-md font-semibold"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700/50",
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    isCurrent
                      ? "bg-white"
                      : item.kind === "incoming"
                        ? "bg-emerald-500"
                        : "bg-blue-500",
                  )}
                />

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold leading-tight truncate">
                    <span>{item.typeLabel}</span>
                    {item.dateLabel && (
                      <span
                        className={cn(
                          "text-[10px] font-normal",
                          isCurrent ? "text-blue-100" : "text-slate-400 dark:text-slate-400",
                        )}
                      >
                        {item.dateLabel}
                      </span>
                    )}
                  </div>

                  {(item.regNumber || item.subject) && (
                    <div
                      className={cn(
                        "text-[10px] truncate mt-0.5",
                        isCurrent ? "text-blue-100 font-medium" : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {item.regNumber ? `№ ${item.regNumber}` : ""}
                      {item.regNumber && item.subject ? " • " : ""}
                      {item.subject || ""}
                    </div>
                  )}
                </div>

                <If is={Boolean(isCurrent)}>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded flex-shrink-0 border border-white/20">
                    Текущий
                  </span>
                </If>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
