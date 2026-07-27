import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, AlertCircle } from "lucide-react";
import { If } from "../If";

interface IProps {
  open: boolean;
  onClose: () => void;
  onInviteVisor?: () => void;
}

export const VisorInviteNoticeModal = ({
  open,
  onClose,
  onInviteVisor,
}: IProps) => {
  return createPortal(
    <AnimatePresence>
      <If is={open}>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/60 shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center relative"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-200/50 dark:border-amber-500/20">
              <AlertCircle size={28} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Пригласите визирующего
            </h3>

            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Поручение доступно после приглашения визирующего. Пожалуйста, сначала пригласите визирующего.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Закрыть
              </button>
              <If is={!!onInviteVisor}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInviteVisor?.();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>Пригласить</span>
                </button>
              </If>
            </div>
          </motion.div>
        </motion.div>
      </If>
    </AnimatePresence>,
    document.body
  );
};
