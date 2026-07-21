import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";
import { If } from "@shared/ui";

interface IProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export const LogoutConfirmModal = ({
  open,
  onCancel,
  onConfirm,
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

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-white/50 dark:border-zinc-700/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 mb-4">
            <LogOut size={26} strokeWidth={2.2} />
          </div>
          <h3
            id="logout-confirm-title"
            className="text-lg font-bold text-zinc-900 dark:text-white"
          >
            Выход из системы
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Вы действительно хотите выйти из системы? Текущий сеанс будет
            завершён.
          </p>
          <div className="mt-6 flex w-full gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl font-semibold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer focus:outline-none"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all disabled:opacity-70 cursor-pointer focus:outline-none flex items-center justify-center gap-2"
            >
              <If is={loading}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </If>
              <If is={!loading}>
                <LogOut className="w-4 h-4" />
              </If>
              {loading ? "Выход…" : "Выйти"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
