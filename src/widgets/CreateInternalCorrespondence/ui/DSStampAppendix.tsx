import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import { cn } from "../lib/utils";
import { DSStamp } from "./DSStamp";

export const DSStampAppendix = ({
  signerName,
  signerInitials,
  signerColor,
  certSerial,
  signedAt,
  validUntil,
  onClose,
}: {
  signerName: string;
  signerInitials: string;
  signerColor: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px]"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-4 z-[101] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 leading-tight">
              Приложение №1
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Электронная подпись
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
        >
          <X size={14} />
          <span>Закрыть</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <p className="text-sm font-semibold text-slate-600 mb-4 text-center">
            Приложение № 1 к письму
          </p>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Электронная подпись
              </p>
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mx-auto",
                  signerColor,
                )}
              >
                {signerInitials}
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Подписано
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {signerName}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Дата подписи
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {signedAt}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    Номер сертификата
                  </p>
                  <p className="text-xs font-mono text-slate-700">
                    {certSerial}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Действителен
                </p>
                <p className="text-sm text-slate-700">{validUntil}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <DSStamp
                name={signerName}
                certSerial={certSerial}
                signedAt={signedAt}
                validUntil={validUntil}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </AnimatePresence>
);
