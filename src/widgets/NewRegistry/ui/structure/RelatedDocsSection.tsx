import React from "react";
import { Link2, ArrowRight } from "lucide-react";
import { cn } from "@shared/lib";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { IRelatedDocumentLink } from "../../lib/structure/types";
import {
  buildRelatedChain,
  UserAvatar,
  RelatedPairCard,
} from "@widgets/CreateInternalCorrespondence/ui/RelatedDocsBlock";

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
  const navigate = useNavigate();
  const hasPairs = Boolean(relatedDocuments && relatedDocuments.length > 0);
  const chain = buildRelatedChain(relatedDocuments, currentDoc);

  if (!hasPairs && chain.length === 0) return null;

  const handleNavigate = (id: number, kind: "incoming" | "outgoing") => {
    if (onDocClick) {
      onDocClick(id, kind);
      return;
    }
    if (kind === "incoming") {
      navigate(AppRoutes.INTERNAL_INCOMING_SHOW.replace(":id", String(id)));
    } else {
      navigate(AppRoutes.INTERNAL_OUTGOING_SHOW.replace(":id", String(id)));
    }
  };

  const count = hasPairs ? relatedDocuments!.length : chain.length;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <Link2 size={14} className="text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Связанные документы ({count})
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {hasPairs
          ? relatedDocuments!.map((rel, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div className="flex items-center text-slate-300 dark:text-slate-600 shrink-0">
                    <ArrowRight size={18} className="stroke-[2]" />
                  </div>
                )}
                <RelatedPairCard
                  rel={rel}
                  currentDocId={currentDoc?.id}
                  onNavigate={handleNavigate}
                />
              </React.Fragment>
            ))
          : chain.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(item.id, item.kind);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border flex-shrink-0 cursor-pointer transition-all shadow-2xs select-none min-w-[260px] max-w-[340px]",
                  item.isCurrent
                    ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900/60 shadow-md font-semibold"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700/50",
                )}
              >
                <UserAvatar
                  photoUrl={item.creator?.photo_url}
                  name={item.creator?.full_name}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold truncate">
                    {item.creator?.full_name || item.typeLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] truncate leading-tight mt-0.5",
                      item.isCurrent
                        ? "text-blue-100"
                        : "text-slate-500 dark:text-slate-400",
                    )}
                  >
                    {item.creator?.position || "Сотрудник"}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-0.5 text-[10px] font-mono",
                      item.isCurrent
                        ? "text-blue-100"
                        : "text-slate-400 dark:text-slate-400",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        item.isCurrent
                          ? "bg-white"
                          : item.kind === "incoming"
                            ? "bg-emerald-500"
                            : "bg-blue-500",
                      )}
                    />
                    <span className="truncate">
                      {item.typeLabel}{" "}
                      {item.regNumber ? `№ ${item.regNumber}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

