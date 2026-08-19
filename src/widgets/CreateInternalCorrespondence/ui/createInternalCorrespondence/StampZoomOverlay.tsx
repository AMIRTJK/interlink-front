import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, X } from "lucide-react";

interface IProps {
  src: string | null;
  onClose: () => void;
}

export const StampZoomOverlay = ({ src, onClose }: IProps) =>
  createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          key="ds-doc-zoom"
          className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans"
          onClick={onClose}
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
                onClick={onClose}
                aria-label="Закрыть"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={src}
              alt="Электронная подпись"
              className="block w-full h-auto select-none"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
