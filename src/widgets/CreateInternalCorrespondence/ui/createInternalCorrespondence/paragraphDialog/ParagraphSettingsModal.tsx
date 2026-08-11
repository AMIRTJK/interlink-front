import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { DEFAULT_PARAGRAPH_FORMAT, type IParagraphFormat } from "./model";
import { ParagraphGeneralGroup } from "./ui/ParagraphGeneralGroup";
import { ParagraphIndentGroup } from "./ui/ParagraphIndentGroup";
import { ParagraphSample } from "./ui/ParagraphSample";
import { ParagraphSpacingGroup } from "./ui/ParagraphSpacingGroup";

interface IProps {
  open: boolean;
  /** Настройки абзаца, в котором стоит курсор */
  initial: IParagraphFormat;
  /** В выделении есть пункты списка — уровень структуры к ним неприменим */
  levelDisabled: boolean;
  onApply: (fmt: IParagraphFormat) => void;
  onClose: () => void;
}

export const ParagraphSettingsModal = ({
  open,
  initial,
  levelDisabled,
  onApply,
  onClose,
}: IProps) => {
  const [fmt, setFmt] = useState<IParagraphFormat>(initial);

  // Диалог всегда открывается на состоянии текущего абзаца: правки прошлого
  // открытия не должны «прилипать» к следующему.
  useEffect(() => {
    if (open) setFmt(initial);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const patch = (next: Partial<IParagraphFormat>) =>
    setFmt((prev) => ({ ...prev, ...next }));

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Абзац"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl dark:border-zinc-700/60 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Абзац
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1 border-b border-slate-100 px-5 pt-2 dark:border-zinc-800">
              <span className="-mb-px border-b-2 border-blue-600 px-2 pb-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                Отступы и интервалы
              </span>
            </div>

            <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
              <ParagraphGeneralGroup
                fmt={fmt}
                levelDisabled={levelDisabled}
                onChange={patch}
              />
              <ParagraphIndentGroup fmt={fmt} onChange={patch} />
              <ParagraphSpacingGroup fmt={fmt} onChange={patch} />
              <ParagraphSample fmt={fmt} />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setFmt(DEFAULT_PARAGRAPH_FORMAT)}
                className="cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Сбросить
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => onApply(fmt)}
                  className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-colors hover:bg-blue-700"
                >
                  ОК
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
