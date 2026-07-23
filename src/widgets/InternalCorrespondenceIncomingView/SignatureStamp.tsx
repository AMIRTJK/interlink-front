import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Maximize2 } from "lucide-react";
import { DSStamp } from "@widgets/CreateInternalCorrespondence/ui/DSStamp";

interface IProps {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}

// Визуальная ЭЦП с просмотром в полном размере — 1-в-1 с исходящим письмом
// (SignerCard): по клику открывается окно «Электронная подпись», при наведении
// показывается подсказка «Увеличить». Закрытие — по фону, крестику или Escape.
export const SignatureStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
}: IProps) => {
  const [zoomOpen, setZoomOpen] = useState(false);
  const stampProps = { name, certSerial, signedAt, validUntil };

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen]);

  return (
    <>
      <div
        className="relative group cursor-zoom-in"
        onClick={() => setZoomOpen(true)}
        title="Нажмите, чтобы посмотреть в полном размере"
      >
        <DSStamp {...stampProps} />
        <div className="pointer-events-none absolute top-1 left-1 flex items-center gap-1 rounded-md bg-slate-900/70 px-1.5 py-1 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 size={10} />
          <span>Увеличить</span>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {zoomOpen && (
            <motion.div
              key="ds-zoom"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans"
              onClick={() => setZoomOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      Электронная подпись
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomOpen(false)}
                    aria-label="Закрыть"
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <DSStamp {...stampProps} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
