import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { resolveApprovalVersionLabel } from "@entities/correspondence";
import { cn } from "@shared/lib";
import {
  DocApproverItem,
  GRADIENTS,
  getInitials,
} from "./approversPanel/approversPanelModel";
import { ApproverCard } from "./approversPanel/ApproverCard";
import { ApproversPanelHistory } from "./approversPanel/ApproversPanelHistory";

export const ApproversPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  approvals = [],
}: {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  approvals?: any[];
}) => {
  const items: DocApproverItem[] = approvals.map((app: any, idx: number) => {
    const user = app.approver || app.user || {};
    const initials = getInitials(user.full_name || "");
    const grad = GRADIENTS[idx % GRADIENTS.length];
    const isSigned = app.status === "approved";

    let signedDateStr = "";
    if (isSigned) {
      const dateVal = app.signed_at || app.updated_at;
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }

    return {
      id: String(app.id),
      name: user.full_name || "Неизвестно",
      position: user.position || "Сотрудник",
      role: "Согласующий",
      initials,
      gradientFrom: grad.from,
      gradientTo: grad.to,
      signed: isSigned,
      signedAt: signedDateStr,
      // Версия решения приходит прямо в записи согласования из /workflow.
      versionLabel: resolveApprovalVersionLabel(app),
    };
  });

  const historyEvents = approvals
    .filter((app: any) => app.status === "approved")
    .map((app: any) => {
      const name = (app.approver || app.user)?.full_name || "Сотрудник";
      const dateVal = app.signed_at || app.updated_at;
      let dateStr = "";
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      return {
        label: `${name} согласовал(а)`,
        date: dateStr,
      };
    });

  const signedCount = items.filter((a) => a.signed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  return (
    <>
      {!hideTab && (
        <div className="absolute z-20" style={{ right: -32, top: 190 }}>
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={cn(
              "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50"
            )}
            aria-label="Согласующие"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "oklch(0.828 0.189 84.429)" }}
            />
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "0.08em",
              }}
            >
              Согласующие
            </span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[500] flex flex-col"
            style={{
              left: "calc(100% + 12px)",
              maxHeight: "var(--icc-panel-max-h, 70vh)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Согласующие
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {totalCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель согласующих"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mx-5 mt-3 mb-1">
              <div className="bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-green-400 rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 px-5 mb-3">
              <span>Подписали </span>
              <span className="font-semibold text-slate-600">{signedCount}</span>
              <span> из </span>
              <span className="font-semibold text-slate-600">{totalCount}</span>
            </p>

            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 min-h-0">
              {items.map((approver, idx) => (
                <ApproverCard key={approver.id} approver={approver} idx={idx} />
              ))}
            </div>

            <ApproversPanelHistory historyEvents={historyEvents} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
