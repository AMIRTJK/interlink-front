import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { IRelatedDocumentLink, IRelatedDocItem } from "@widgets/NewRegistry/lib/structure/types";

interface IProps {
  relatedDocuments?: IRelatedDocumentLink[];
}

const DocBadge: React.FC<{
  doc?: IRelatedDocItem;
  label: string;
  onClick: (id: number, kind?: string) => void;
}> = ({ doc, label, onClick }) => {
  if (!doc) return null;

  const isIncoming = doc.kind === "incoming" || label === "Входящее";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(doc.id, doc.kind);
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}:
      </span>
      <If is={Boolean(doc.reg_number)}>
        <span className="font-mono text-xs font-semibold text-blue-600">
          {doc.reg_number}
        </span>
      </If>
      <span className="text-xs text-slate-800 font-medium truncate max-w-[220px]">
        {doc.subject || "Без темы"}
      </span>
    </div>
  );
};

export const RelatedDocsAccordion: React.FC<IProps> = ({ relatedDocuments }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!relatedDocuments || relatedDocuments.length === 0) return null;

  const handleDocClick = (id: number, kind?: string) => {
    if (kind === "incoming") {
      navigate(AppRoutes.INTERNAL_INCOMING_SHOW.replace(":id", String(id)));
    } else {
      navigate(AppRoutes.INTERNAL_OUTGOING_SHOW.replace(":id", String(id)));
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Шапка аккордеона */}
      <div
        onClick={() => setIsExpanded((v) => !v)}
        className="px-6 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 select-none transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Link2 size={16} />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Связанные документы
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
            {relatedDocuments.length}
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

      {/* Содержимое аккордеона */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-2.5 bg-slate-50/30">
              {relatedDocuments.map((rel, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 flex-wrap text-xs bg-white p-3 rounded-xl border border-slate-100 shadow-2xs"
                >
                  <DocBadge
                    doc={rel.incoming}
                    label="Входящее"
                    onClick={handleDocClick}
                  />
                  <If is={Boolean(rel.incoming && rel.outgoing)}>
                    <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
                  </If>
                  <DocBadge
                    doc={rel.outgoing}
                    label="Исходящее"
                    onClick={handleDocClick}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RelatedDocsBlock = RelatedDocsAccordion;
