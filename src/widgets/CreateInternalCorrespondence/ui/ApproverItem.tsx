import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquarePlus,
  Send,
  Shield,
  Check,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Approver } from "../types";
import { DSStamp } from "./DSStamp";

interface IProps {
  approver: Approver;
  idx: number;
  docId?: string | number;
  isApproverInviting: boolean;
  inviteApprover: (vars: { docId: string | number; users: number[] }) => void;
  applyApproverDS: (recordId: string) => void;
  toggleApproverComment: (id: string) => void;
  updateApproverComment: (id: string, text: string) => void;
  onRemoveApprover: (id: string) => void;
}

export const ApproverItem = ({
  approver,
  idx,
  docId,
  isApproverInviting,
  inviteApprover,
  applyApproverDS,
  toggleApproverComment,
  updateApproverComment,
  onRemoveApprover,
}: IProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all overflow-hidden flex flex-col",
        approver.approved
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-slate-100 bg-slate-50/40"
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
          {idx + 1}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            approver.color
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

      <If is={!approver.approved || !!approver.isInvited}>
        <div className="flex items-center justify-end gap-1.5 px-3 pb-2.5 pt-1.5 border-t border-slate-100/60 flex-shrink-0">
          <If is={!approver.approved}>
            <button
              onClick={() => toggleApproverComment(approver.id)}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-all border",
                approver.showCommentInput || approver.comment
                  ? "bg-amber-50 border-amber-200 text-amber-600"
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
              )}
              title="Добавить комментарий"
            >
              <MessageSquarePlus size={12} />
            </button>
          </If>
          <If is={!approver.isInvited && !!docId}>
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
          </If>
          <If is={!!approver.isInvited && approver.dsApplied}>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <Shield size={10} className="text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-600">
                ЭЦП
              </span>
              <Check size={10} className="text-emerald-500" />
            </div>
          </If>
          <If is={!!approver.isInvited && !approver.dsApplied && !approver.approved}>
            <button
              onClick={() => {
                if (approver.approvalRecordId) {
                  applyApproverDS(approver.approvalRecordId);
                }
              }}
              disabled={approver.dsLoading}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                approver.dsLoading
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm"
              )}
            >
              <If is={approver.dsLoading}>
                <Clock size={11} className="animate-spin" />
              </If>
              <If is={!approver.dsLoading}>
                <Check size={11} />
              </If>
              <span>
                {approver.dsLoading ? "Согласую..." : "Согласовать"}
              </span>
            </button>
          </If>
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

      <AnimatePresence>
        {approver.showCommentInput && !approver.approved && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-white/60">
              <div className="flex items-start gap-2">
                <MessageSquare
                  size={12}
                  className="text-amber-500 mt-0.5 flex-shrink-0"
                />
                <textarea
                  placeholder="Комментарий к согласованию..."
                  className="flex-1 text-[11px] text-slate-700 placeholder-slate-400 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all min-h-[54px] leading-relaxed"
                  value={approver.comment}
                  onChange={(e) =>
                    updateApproverComment(
                      approver.id,
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <If is={approver.dsApplied}>
        <div
          className={cn(
            "px-3 py-2 border-t",
            approver.approved
              ? "border-emerald-100 bg-emerald-50/60"
              : "border-purple-100 bg-purple-50/40"
          )}
        >
          <DSStamp
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
