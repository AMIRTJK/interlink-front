import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSettingsTheme } from "./settingsUi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  width?: number;
  maskClosable?: boolean;
  closable?: boolean;
}

/**
 * Собственное окно настроек (без antd Modal): рендерится в портал, полностью
 * управляет фоном/тёмным режимом и подхватывает акцент активной темы.
 */
export const SettingsModalShell = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  width = 400,
  maskClosable = true,
  closable = true,
}: Props) => {
  const { accent, gradient } = useSettingsTheme();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closable, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={() => maskClosable && closable && onClose()}
        >
          <motion.div
            style={{ maxWidth: width, ["--accent" as string]: accent }}
            className="w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm"
                    style={{ background: accent }}
                  >
                    {icon}
                  </span>
                )}
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {title}
                </h3>
              </div>

              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
