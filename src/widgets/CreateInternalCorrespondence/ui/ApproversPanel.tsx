import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { Approver, RecipientOption } from "../types";
import { ApproverItem } from "./ApproverItem";

interface IProps {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  approvers: Approver[];
  onAddApprover: (r: RecipientOption) => void;
  onRemoveApprover: (id: string) => void;
  availableUsers: RecipientOption[];
  inviteApprover: (vars: { docId: string | number; users: number[] }) => void;
  isApproverInviting: boolean;
  applyApproverDS: (recordId: string) => void;
  toggleApproverComment: (id: string) => void;
  updateApproverComment: (id: string, text: string) => void;
  docId?: string | number;
}

export const ApproversPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  approvers,
  onAddApprover,
  onRemoveApprover,
  availableUsers,
  inviteApprover,
  isApproverInviting,
  applyApproverDS,
  toggleApproverComment,
  updateApproverComment,
  docId,
}: IProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");

  const availableApprovers = availableUsers.filter(
    (r) =>
      !approvers.some((a) => a.id === r.id) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.org.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <>
      {!hideTab && (
        <div className="absolute z-20 right-[-36px] top-[190px]">
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            className={cn(
              "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
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
            className="absolute top-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
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
                  {approvers.length}
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

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center z-40 relative">
              <span className="text-xs text-slate-500 font-medium">
                Список согласующих
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UserPlus size={12} />
                  <span>Добавить</span>
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden w-64"
                    >
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Поиск..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          autoFocus
                          className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        <If is={availableApprovers.length === 0}>
                          <p className="text-xs text-slate-400 text-center py-4">
                            Нет доступных
                          </p>
                        </If>
                        <If is={availableApprovers.length > 0}>
                          {availableApprovers.map((r) => (
                            <button
                              key={r.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onAddApprover(r);
                                setShowDropdown(false);
                                setSearch("");
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-100 text-slate-700">
                                {r.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {r.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {r.org}
                                </p>
                              </div>
                            </button>
                          ))}
                        </If>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              <If is={approvers.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <UserPlus size={15} />
                  <span>Нажмите «Добавить»</span>
                </div>
              </If>
              <If is={approvers.length > 0}>
                {approvers.map((approver, idx) => (
                  <ApproverItem
                    key={approver.id}
                    approver={approver}
                    idx={idx}
                    docId={docId}
                    isApproverInviting={isApproverInviting}
                    inviteApprover={inviteApprover}
                    applyApproverDS={applyApproverDS}
                    toggleApproverComment={toggleApproverComment}
                    updateApproverComment={updateApproverComment}
                    onRemoveApprover={onRemoveApprover}
                  />
                ))}
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
