import * as React from "react";
import { CheckCircle, X } from "lucide-react";
import { T } from "../../theme/tokens";
import type { ToastItem } from "../../model";

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "12px 16px",
            boxShadow: T.shadowMd,
            animation: "toastSlideIn 0.25s ease-out forwards",
            pointerEvents: "auto",
            minWidth: 260,
            maxWidth: 340,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={14} color={T.success} />
          </div>
          <span
            style={{
              fontSize: 13,
              color: T.textPrimary,
              fontWeight: 500,
              fontFamily: T.font,
              flex: 1,
            }}
          >
            {t.message}
          </span>
          <button
            onClick={() => onRemove(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textSecondary,
              padding: 2,
              display: "flex",
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
