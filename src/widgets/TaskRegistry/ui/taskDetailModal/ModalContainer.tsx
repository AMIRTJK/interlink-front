import * as React from "react";
import { createPortal } from "react-dom";

export function ModalContainer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-4xl h-[90vh] min-h-[90vh] max-h-[90vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
