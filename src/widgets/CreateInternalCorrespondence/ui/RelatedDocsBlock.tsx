import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { cn } from "@shared/lib";
import type {
  IRelatedDocumentLink,
  IRelatedDocCreator,
} from "@widgets/NewRegistry/lib/structure/types";
import {
  buildRelatedChain,
  UserAvatar,
  RelatedPairCard,
} from "./relatedDocs";

export { buildRelatedChain, UserAvatar, RelatedPairCard } from "./relatedDocs";
export type { IChainDocItem } from "./relatedDocs";

interface IProps {
  relatedDocuments?: IRelatedDocumentLink[];
  currentDoc?: {
    id?: number | string;
    kind?: "incoming" | "outgoing" | string;
    date?: string;
    reg_number?: string;
    subject?: string;
    creator?: IRelatedDocCreator | null;
  };
  variant?: "card" | "fullWidth";
}

export const RelatedDocsAccordion: React.FC<IProps> = ({
  relatedDocuments,
  currentDoc,
  variant = "card",
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const hasPairs = Boolean(relatedDocuments && relatedDocuments.length > 0);
  const chain = buildRelatedChain(relatedDocuments, currentDoc);

  if (!hasPairs && chain.length <= 1) {
    return null;
  }

  const handleNavigate = (id: number, kind: "incoming" | "outgoing") => {
    if (kind === "incoming") {
      navigate(AppRoutes.INTERNAL_INCOMING_SHOW.replace(":id", String(id)));
    } else {
      navigate(AppRoutes.INTERNAL_OUTGOING_SHOW.replace(":id", String(id)));
    }
  };

  const count = hasPairs ? relatedDocuments!.length : chain.length;

  return (
    <div
      className={cn(
        variant === "fullWidth"
          ? "flex-shrink-0 flex flex-col bg-white border-b border-slate-200"
          : "mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden",
      )}
    >
      <div
        onClick={() => setIsExpanded((v) => !v)}
        className={cn(
          "flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none transition-colors",
          variant === "fullWidth"
            ? "px-6 h-12"
            : "px-6 py-3.5 border-b border-slate-100",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Link2 size={16} />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Связанные документы
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
            {count}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {isExpanded ? "Свернуть" : "Развернуть"}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              "text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "p-4 bg-slate-50/40",
                variant === "fullWidth" && "px-6 border-t border-slate-100",
              )}
            >
              <div className="flex items-center gap-3 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-slate-200">
                {hasPairs
                  ? relatedDocuments!.map((rel, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <div className="flex items-center text-slate-300 shrink-0">
                            <ArrowRight size={20} className="stroke-[2]" />
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
                          "flex items-center gap-3 p-3.5 rounded-2xl border flex-shrink-0 cursor-pointer transition-all shadow-2xs select-none min-w-[280px] bg-white",
                          item.isCurrent
                            ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
                            : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30",
                        )}
                      >
                        <UserAvatar
                          photoUrl={item.creator?.photo_url}
                          name={item.creator?.full_name}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.creator?.full_name || item.typeLabel}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate leading-tight">
                            {item.creator?.position || "Сотрудник"}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                item.kind === "incoming"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RelatedDocsBlock = RelatedDocsAccordion;
