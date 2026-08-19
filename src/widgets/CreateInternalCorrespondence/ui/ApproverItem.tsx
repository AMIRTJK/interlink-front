import React from "react";
import { X, Send } from "lucide-react";
import { ApprovalVersionBadge } from "@entities/correspondence";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Approver } from "../types";
import { DSStampPreview } from "./DSStampPreview";

interface IProps {
  approver: Approver;
  idx: number;
  docId?: string | number;
  isApproverInviting: boolean;
  inviteApprover: (vars: { docId: string | number; users: number[] }) => void;
  onRemoveApprover: (id: string) => void;
  /** Версия, открытая в редакторе: с ней сравнивается версия решения. */
  activeVersionId?: string | number | null;
}

export const ApproverItem = ({
  approver,
  idx,
  docId,
  isApproverInviting,
  inviteApprover,
  onRemoveApprover,
  activeVersionId,
}: IProps) => {
  const isVersionMismatch =
    approver.versionId != null &&
    activeVersionId != null &&
    String(approver.versionId) !== String(activeVersionId);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all overflow-hidden flex flex-col",
        approver.approved
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-slate-100 bg-slate-50/40",
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
          {idx + 1}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            approver.color,
          )}
        >
          {approver.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 break-words">
            {approver.name}
          </p>
          <p className="text-[10px] text-slate-500 break-words">
            {approver.role}
          </p>
          <If is={Boolean(approver.approved && approver.versionLabel)}>
            <div className="mt-1">
              <ApprovalVersionBadge
                label={approver.versionLabel ?? null}
                isMismatch={isVersionMismatch}
              />
            </div>
          </If>
        </div>
        <If is={!approver.approved && !approver.isInvited}>
          <button
            onClick={() => onRemoveApprover(approver.id)}
            className="text-slate-300 hover:text-rose-400 transition-colors ml-1 flex-shrink-0"
          >
            <X size={13} />
          </button>
        </If>
      </div>

      <If is={!approver.isInvited && !!docId}>
        <div className="flex items-center justify-end gap-1.5 px-3 pb-2.5 pt-1.5 border-t border-slate-100/60 flex-shrink-0">
          <button
            onClick={() =>
              inviteApprover({
                docId: docId!,
                users: [Number(approver.id)],
              })
            }
            disabled={isApproverInviting}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Send size={11} />
            <span>
              {isApproverInviting ? "..." : "Пригласить"}
            </span>
          </button>
        </div>
      </If>

      <If is={Boolean(approver.note || (approver.approved && approver.comment))}>
        <div className="px-3 py-2 bg-amber-50/70 border-t border-amber-100/80 text-[11px] text-slate-700">
          <span className="font-semibold block text-[10px] text-amber-800 mb-0.5">
            💬 Комментарий:
          </span>
          <p className="whitespace-pre-wrap leading-relaxed">
            {approver.note || approver.comment}
          </p>
          <If is={Boolean(approver.decided_at)}>
            <span className="text-[9px] text-slate-400 block mt-1">
              Решение принято: {new Date(approver.decided_at!).toLocaleString("ru-RU")}
            </span>
          </If>
        </div>
      </If>

      <If is={approver.dsApplied}>
        <div
          className={cn(
            "px-3 py-2 border-t",
            approver.approved
              ? "border-emerald-100 bg-emerald-50/60"
              : "border-purple-100 bg-purple-50/40",
          )}
        >
          <DSStampPreview
            name={approver.name}
            certSerial={`SN-2026-${approver.initials}-${Math.abs(Number(approver.id) * 317 + 10000)}`}
            signedAt={new Date().toLocaleDateString("ru-RU")}
            validUntil="аз 20.03.2025 то 20.03.2026"
          />
        </div>
      </If>
    </div>
  );
};
