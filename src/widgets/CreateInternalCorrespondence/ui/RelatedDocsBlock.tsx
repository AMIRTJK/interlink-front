import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { IRelatedDocumentLink, IRelatedDocItem } from "@widgets/NewRegistry/lib/structure/types";

export interface IChainDocItem {
  id: number;
  kind: "incoming" | "outgoing";
  typeLabel: string;
  dateLabel?: string;
  regNumber?: string;
  subject?: string;
  isCurrent?: boolean;
  rawDateObj?: Date;
}

export function buildRelatedChain(
  relatedDocuments?: IRelatedDocumentLink[],
  currentDoc?: {
    id?: number | string;
    kind?: "incoming" | "outgoing" | string;
    date?: string;
    reg_number?: string;
    subject?: string;
  },
): IChainDocItem[] {
  const map = new Map<string, IChainDocItem>();

  const formatDateStr = (raw?: string) => {
    if (!raw) return undefined;
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return undefined;
      return d.toLocaleDateString("ru-RU");
    } catch {
      return undefined;
    }
  };

  const currentIdNum = currentDoc?.id != null ? Number(currentDoc.id) : undefined;
  const currentKind = currentDoc?.kind === "incoming" ? "incoming" : "outgoing";

  const addDoc = (
    doc?: IRelatedDocItem | any,
    fallbackKind?: "incoming" | "outgoing",
    forceCurrent?: boolean,
  ) => {
    if (!doc || doc.id == null) return;
    const id = Number(doc.id);
    const kind = (doc.kind as "incoming" | "outgoing") || fallbackKind || "incoming";
    const key = `${kind}-${id}`;
    if (map.has(key)) return;

    const isCurrent =
      forceCurrent ||
      (currentIdNum != null && id === currentIdNum && kind === currentKind);

    const rawDate = doc.doc_date || doc.sent_at || doc.created_at || doc.date;
    const formattedDate =
      formatDateStr(rawDate) ||
      (typeof doc.date === "string" && doc.date.includes(".") ? doc.date : undefined);
    const rawDateObj = rawDate ? new Date(rawDate) : undefined;

    map.set(key, {
      id,
      kind,
      typeLabel: kind === "incoming" ? "Входящее письмо" : "Исходящее письмо",
      dateLabel: formattedDate ? `от ${formattedDate}` : "",
      regNumber: doc.reg_number || doc.inboundNumber,
      subject: doc.subject,
      isCurrent: Boolean(isCurrent),
      rawDateObj,
    });
  };

  if (relatedDocuments && relatedDocuments.length > 0) {
    relatedDocuments.forEach((rel) => {
      if (rel.incoming) addDoc(rel.incoming, "incoming");
      if (rel.outgoing) addDoc(rel.outgoing, "outgoing");
    });
  }

  if (currentDoc && currentDoc.id != null) {
    const key = `${currentKind}-${currentIdNum}`;
    if (!map.has(key)) {
      addDoc(currentDoc, currentKind, true);
    } else {
      const existing = map.get(key)!;
      existing.isCurrent = true;
      if (!existing.dateLabel && currentDoc.date) {
        existing.dateLabel = currentDoc.date.includes("от")
          ? currentDoc.date
          : `от ${currentDoc.date}`;
      }
    }
  }

  const list = Array.from(map.values());

  list.sort((a, b) => {
    if (a.rawDateObj && b.rawDateObj) {
      const diff = a.rawDateObj.getTime() - b.rawDateObj.getTime();
      if (diff !== 0) return diff;
    }
    if (a.id !== b.id) return a.id - b.id;
    return a.kind === "incoming" ? -1 : 1;
  });

  return list;
}

interface IProps {
  relatedDocuments?: IRelatedDocumentLink[];
  currentDoc?: {
    id?: number | string;
    kind?: "incoming" | "outgoing" | string;
    date?: string;
    reg_number?: string;
    subject?: string;
  };
}

export const RelatedDocsAccordion: React.FC<IProps> = ({
  relatedDocuments,
  currentDoc,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  const chain = buildRelatedChain(relatedDocuments, currentDoc);

  if (chain.length <= 1 && (!relatedDocuments || relatedDocuments.length === 0)) {
    return null;
  }

  const handleDocClick = (id: number, kind: "incoming" | "outgoing") => {
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
            {chain.length}
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

      {/* Содержимое аккордеона: горизонтальная цепочка */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50/40">
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-slate-200">
                {chain.map((item, index) => {
                  const isCurrent = item.isCurrent;

                  return (
                    <React.Fragment key={`${item.kind}-${item.id}`}>
                      {index > 0 && (
                        <ArrowRight
                          size={18}
                          className="text-slate-300 flex-shrink-0 mx-1"
                        />
                      )}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocClick(item.id, item.kind);
                        }}
                        className={cn(
                          "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border flex-shrink-0 cursor-pointer transition-all shadow-2xs select-none min-w-[200px] max-w-[300px]",
                          isCurrent
                            ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 shadow-md font-semibold"
                            : "bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            isCurrent
                              ? "bg-white"
                              : item.kind === "incoming"
                                ? "bg-emerald-500"
                                : "bg-blue-500",
                          )}
                        />

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold leading-snug truncate">
                            <span>{item.typeLabel}</span>
                            {item.dateLabel && (
                              <span
                                className={cn(
                                  "text-[11px] font-normal",
                                  isCurrent ? "text-blue-100" : "text-slate-400",
                                )}
                              >
                                {item.dateLabel}
                              </span>
                            )}
                          </div>

                          {(item.regNumber || item.subject) && (
                            <div
                              className={cn(
                                "text-[11px] truncate mt-0.5",
                                isCurrent ? "text-blue-100 font-medium" : "text-slate-500",
                              )}
                            >
                              {item.regNumber ? `№ ${item.regNumber}` : ""}
                              {item.regNumber && item.subject ? " • " : ""}
                              {item.subject || ""}
                            </div>
                          )}
                        </div>

                        <If is={Boolean(isCurrent)}>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md flex-shrink-0 border border-white/20">
                            Текущий
                          </span>
                        </If>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RelatedDocsBlock = RelatedDocsAccordion;
