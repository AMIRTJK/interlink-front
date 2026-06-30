import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, UserPlus, User, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { FinalSigner, RecipientOption } from "../types";
import { SignerCard } from "./SignerCard";

interface IProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  finalSigner: FinalSigner | null;
  onAssignSigner: (user: any) => void;
  assignSelfAsSigner: () => void;
  inviteSigner: (vars: { docId: string | number; users: number[] }) => void;
  isSignerInviting: boolean;
  applyFinalDS: () => void;
  isActiveVersionForSign: boolean;
  stampVisible: boolean;
  setStampVisible: (v: boolean) => void;
  handleInsertStamp: () => void;
  availableUsers: RecipientOption[];
  isSigned: boolean;
  docCreator: any;
  docId?: string | number;
}

export const SignerPanel = ({
  isOpen,
  onOpen,
  onClose,
  finalSigner,
  onAssignSigner,
  assignSelfAsSigner,
  inviteSigner,
  isSignerInviting,
  applyFinalDS,
  isActiveVersionForSign,
  stampVisible,
  setStampVisible,
  handleInsertStamp,
  availableUsers,
  isSigned,
  docCreator,
  docId,
}: IProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = availableUsers
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 15);

  return (
    <>
      <div className="absolute z-20" style={{ right: -36, top: 190 }}>
        <motion.button
          onClick={isOpen ? onClose : onOpen}
          className={cn(
            "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
            isOpen ? "bg-slate-50" : "hover:bg-slate-50"
          )}
          aria-label="Подписывающий"
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "oklch(0.6 0.25 250)" }}
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
            Подписывающий
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 h-full w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{ left: "calc(100% + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Подписывающий
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель подписывающего"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center z-40 relative">
              <span className="text-xs text-slate-500 font-medium">
                Назначить подписанта
              </span>
              <div className="flex items-center gap-1">
                <If is={docCreator && finalSigner?.id !== String(docCreator.id)}>
                  <button
                    onClick={assignSelfAsSigner}
                    disabled={isSigned}
                    title="Назначить себя"
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg transition-colors border",
                      isSigned
                        ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <User size={12} />
                  </button>
                </If>
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  disabled={isSigned}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors",
                    isSigned
                      ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100"
                  )}
                >
                  <UserPlus size={12} />
                  <span>{finalSigner ? "Изменить" : "Назначить"}</span>
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
                          placeholder="Поиск сотрудника..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          autoFocus
                          className="w-full text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {filteredUsers.map((r) => (
                          <button
                            key={r.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onAssignSigner(r);
                              setShowDropdown(false);
                              setSearch("");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-purple-100 text-purple-700">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              <If is={!finalSigner}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <PenLine size={15} />
                  <span>Нажмите «Назначить»</span>
                </div>
              </If>

              <If is={!!finalSigner}>
                <SignerCard
                  signer={finalSigner!}
                  docId={docId}
                  isSignerInviting={isSignerInviting}
                  inviteSigner={inviteSigner}
                  applyFinalDS={applyFinalDS}
                  isActiveVersionForSign={isActiveVersionForSign}
                  stampVisible={stampVisible}
                  setStampVisible={setStampVisible}
                  handleInsertStamp={handleInsertStamp}
                />
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
