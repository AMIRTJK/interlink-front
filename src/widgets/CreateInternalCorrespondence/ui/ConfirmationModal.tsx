import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { If } from "@shared/ui";

interface IProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  icon: React.ReactNode;
  iconBg?: string;
  confirmBtnBg?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  open,
  title,
  message,
  confirmText,
  cancelText = "Отмена",
  icon,
  iconBg = "bg-th-accent-50 dark:bg-th-accent-500/10 text-th-accent-500",
  confirmBtnBg = "bg-th-accent-600 hover:bg-th-accent-700 shadow-th-accent-500/25",
  onConfirm,
  onCancel,
}: IProps) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel, loading]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-th-base border border-white/50 dark:border-th-high/60 shadow-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}>
                {icon}
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {message}
              </p>
              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-2xl font-semibold text-sm bg-zinc-100 dark:bg-th-raised text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-th-high transition-colors disabled:opacity-50 cursor-pointer focus:outline-none"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all disabled:opacity-70 cursor-pointer focus:outline-none flex items-center justify-center gap-2 ${confirmBtnBg} shadow-lg`}
                >
                  <If is={loading}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </If>
                  <span>{confirmText}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </If>
    </AnimatePresence>,
    document.body
  );
};
