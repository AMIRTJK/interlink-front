import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@shared/lib";
import type { IRelatedDocumentLink } from "@widgets/NewRegistry/lib/structure/types";
import { formatDateStr } from "./relatedDocsModel";
import { UserBlock } from "./UserBlock";

interface IProps {
  rel: IRelatedDocumentLink;
  currentDocId?: number | string;
  onNavigate: (id: number, kind: "incoming" | "outgoing") => void;
}

export const RelatedPairCard: React.FC<IProps> = ({
  rel,
  currentDocId,
  onNavigate,
}) => {
  const incoming = rel.incoming;
  const outgoing = rel.outgoing;
  if (!incoming && !outgoing) return null;

  const isIncomingCurrent =
    currentDocId != null &&
    incoming?.id != null &&
    Number(incoming.id) === Number(currentDocId);
  const isOutgoingCurrent =
    currentDocId != null &&
    outgoing?.id != null &&
    Number(outgoing.id) === Number(currentDocId);
  const isPairCurrent = isIncomingCurrent || isOutgoingCurrent;

  const dateVal =
    incoming?.sent_at ||
    incoming?.created_at ||
    outgoing?.sent_at ||
    outgoing?.created_at;
  const formattedDate = formatDateStr(dateVal);

  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-2xl border flex-shrink-0 transition-all shadow-2xs select-none min-w-[460px] max-w-[560px] bg-white",
        isPairCurrent
          ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
          : "border-slate-200 hover:border-blue-300 hover:shadow-xs",
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-[10px] border border-blue-100">
            {rel.link_label || "Ответное письмо"}
          </span>
          {formattedDate && (
            <span className="text-[11px] text-slate-400 font-medium">
              от {formattedDate}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          {incoming?.reg_number && <span>{incoming.reg_number}</span>}
          {incoming?.reg_number && outgoing?.reg_number && <span>→</span>}
          {outgoing?.reg_number && <span>{outgoing.reg_number}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {incoming ? (
          <UserBlock
            user={incoming.creator}
            kind="incoming"
            regNumber={incoming.reg_number}
            isCurrent={isIncomingCurrent}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(incoming.id, "incoming");
            }}
          />
        ) : (
          <div className="flex-1 text-xs text-slate-400 italic p-2">
            Отправитель не указан
          </div>
        )}

        <div className="flex items-center justify-center shrink-0 px-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <ArrowRight size={15} className="stroke-[2.5]" />
          </div>
        </div>

        {outgoing ? (
          <UserBlock
            user={outgoing.creator}
            kind="outgoing"
            regNumber={outgoing.reg_number}
            isCurrent={isOutgoingCurrent}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(outgoing.id, "outgoing");
            }}
          />
        ) : (
          <div className="flex-1 text-xs text-slate-400 italic p-2">
            Получатель не указан
          </div>
        )}
      </div>
    </div>
  );
};

