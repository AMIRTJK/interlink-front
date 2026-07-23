import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import { cn } from "@shared/lib";
import { SignatureStamp } from "./SignatureStamp";

interface DocSignerItem {
  id: string;
  name: string;
  position: string;
  role: "Подписывающий";
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  signed: boolean;
  signedAt: string;
}

const GRADIENTS = [
  { from: "#f97316", to: "#ef4444" },
  { from: "#3b82f6", to: "#1d4ed8" },
  { from: "#10b981", to: "#059669" },
];

export const SignersPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  signatures = [],
}: {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  signatures?: any[];
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const items: DocSignerItem[] = signatures.map((sig: any, idx: number) => {
    const user = sig.user || sig.approver || {};
    const initials = getInitials(user.full_name || "");
    const grad = GRADIENTS[idx % GRADIENTS.length];
    const isSigned = sig.status === "signed";

    let signedDateStr = "";
    if (isSigned) {
      const dateVal = sig.signed_at || sig.updated_at;
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }

    return {
      id: String(sig.id),
      name: user.full_name || "Неизвестно",
      position: user.position || "Сотрудник",
      role: "Подписывающий",
      initials,
      gradientFrom: grad.from,
      gradientTo: grad.to,
      signed: isSigned,
      signedAt: signedDateStr,
    };
  });

  const historyEvents = signatures
    .filter((sig: any) => sig.status === "signed")
    .map((sig: any) => {
      const name = (sig.user || sig.approver)?.full_name || "Сотрудник";
      const dateVal = sig.signed_at || sig.updated_at;
      let dateStr = "";
      if (dateVal) {
        const d = new Date(dateVal);
        const pad = (n: number) => String(n).padStart(2, "0");
        dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      return {
        label: `${name} подписал(а)`,
        date: dateStr,
      };
    });

  const signedCount = items.filter((a) => a.signed).length;
  const totalCount = items.length;
  const dotColor =
    totalCount === 0
      ? "bg-slate-300"
      : signedCount === totalCount
        ? "bg-green-400"
        : signedCount > 0
          ? "bg-amber-400"
          : "bg-slate-300";
  const progressPct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  return (
    <>
      {!hideTab && (
        <div
          className="absolute z-20"
          style={{ right: -32, top: 10 }}
        >
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={cn(
              "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
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
                  Подписывающие
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {totalCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель подписывающих"
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
              {items.map((signer, idx) => {
                return (
                  <motion.div
                    key={signer.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.06,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${signer.gradientFrom}, ${signer.gradientTo})`,
                        }}
                      >
                        {signer.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] text-slate-800 leading-tight break-words">
                          {signer.name}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 bg-purple-50 text-purple-700 border-purple-200">
                        {signer.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {signer.position}
                    </p>

                    {signer.signed && (
                      <SignatureStamp
                        name={signer.name}
                        certSerial={`SN-2026-${signer.initials}-84201`}
                        signedAt={signer.signedAt.split(" ")[0] || signer.signedAt}
                        validUntil="аз 20.03.2025 то 20.03.2026"
                      />
                    )}

                    {!signer.signed && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                          <Clock size={9} className="text-amber-500" />
                        </span>
                        <span className="text-[11px] font-semibold text-amber-600">
                          Ожидает подписи
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="w-full text-left flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                <span>История согласования</span>
                <motion.span
                  animate={{ rotate: showHistory ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 flex flex-col gap-2">
                      {historyEvents.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-600 leading-tight">
                              {event.label}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {event.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
