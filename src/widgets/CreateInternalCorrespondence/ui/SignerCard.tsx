import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Send, Shield, Check, Clock, Monitor, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { FinalSigner } from "../types";
import { DSStamp } from "./DSStamp";

interface IProps {
  signer: FinalSigner;
  docId?: string | number;
  isSignerInviting: boolean;
  inviteSigner: (vars: { docId: string | number; users: number[] }) => void;
  applyFinalDS: () => void;
  isActiveVersionForSign: boolean;
  stampVisible: boolean;
  setStampVisible: (v: boolean) => void;
  handleInsertStamp: () => void;
}

export const SignerCard = ({
  signer,
  docId,
  isSignerInviting,
  inviteSigner,
  applyFinalDS,
  isActiveVersionForSign,
  stampVisible,
  setStampVisible,
  handleInsertStamp,
}: IProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all flex flex-col overflow-hidden",
        signer.dsApplied
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-slate-100 bg-slate-50/40"
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            signer.color
          )}
        >
          {signer.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">
            {signer.name}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {signer.role}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <If is={!signer.isInvited && !!docId}>
            <button
              onClick={() =>
                inviteSigner({
                  docId: docId!,
                  users: [Number(signer.id)],
                })
              }
              disabled={isSignerInviting}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Send size={11} />
              <span>
                {isSignerInviting ? "..." : "Пригласить"}
              </span>
            </button>
          </If>
          <If is={!!signer.isInvited && signer.dsApplied}>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
              <Shield size={10} className="text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-600">
                Подписано
              </span>
              <Check size={10} className="text-emerald-500" />
            </div>
          </If>
          <If is={!!signer.isInvited && !signer.dsApplied}>
            <button
              onClick={applyFinalDS}
              disabled={signer.dsLoading || !isActiveVersionForSign}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                signer.dsLoading || !isActiveVersionForSign
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 shadow-sm"
              )}
            >
              <If is={signer.dsLoading}>
                <Clock size={11} className="animate-spin" />
              </If>
              <If is={!signer.dsLoading}>
                <PenLine size={11} />
              </If>
              <span>
                {signer.dsLoading ? "Подписываю..." : "Подписать"}
              </span>
            </button>
          </If>
        </div>
      </div>

      <div
        className={cn(
          "px-3 py-2.5 border-t rounded-b-xl",
          signer.dsApplied
            ? "border-emerald-100 bg-emerald-50/40"
            : "border-slate-100 bg-slate-50/40"
        )}
      >
        <AnimatePresence mode="wait">
          <If is={!stampVisible && !signer.dsApplied && !isActiveVersionForSign}>
            <motion.div
              key="not-for-sign"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-400 text-[11px] font-medium rounded-lg border border-dashed border-slate-200 text-center"
            >
              <Shield size={12} />
              <span>
                Откройте версию, отмеченную «Для подписи»
              </span>
            </motion.div>
          </If>
          <If is={!stampVisible && !signer.dsApplied && isActiveVersionForSign}>
            <motion.button
              key="insert-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleInsertStamp}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-lg transition-colors border border-blue-200 shadow-sm cursor-pointer"
            >
              <Monitor size={12} />
              <span>Указать место для ЭЦП</span>
            </motion.button>
          </If>
          <If is={stampVisible && !signer.dsApplied}>
            <motion.button
              key="remove-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStampVisible(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-500 text-[11px] font-semibold rounded-lg transition-colors border border-slate-200 hover:border-rose-200 cursor-pointer"
            >
              <X size={12} />
              <span>Убрать место для ЭЦП</span>
            </motion.button>
          </If>
          <If is={signer.dsApplied}>
            <DSStamp
              name={signer.name}
              certSerial={`SN-2026-${signer.initials}-84201`}
              signedAt={new Date().toLocaleDateString("ru-RU")}
              validUntil="аз 20.03.2025 то 20.03.2026"
            />
          </If>
        </AnimatePresence>
      </div>
    </div>
  );
};
