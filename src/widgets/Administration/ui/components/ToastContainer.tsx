import * as React from "react";
import { CheckCircle, X } from "lucide-react";
import { useIsDarkMode } from "@shared/lib";
import { T } from "../../theme/tokens";
import type { ToastItem } from "../../model";

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  const isDark = useIsDarkMode();
  if (toasts.length === 0) return null;

  const bg = isDark ? "rgba(15, 23, 42, 0.92)" : T.surface;
  const border = isDark ? "rgba(255, 255, 255, 0.12)" : T.border;
  const textColor = isDark ? "#F8FAFC" : T.textPrimary;
  const textSecColor = isDark ? "#94A3B8" : T.textSecondary;
  const shadow = isDark
    ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)"
    : T.shadowMd;
  const iconBg = isDark ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5";
  const iconColor = isDark ? "#34D399" : T.success;

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
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: "12px 16px",
            boxShadow: shadow,
            backdropFilter: isDark ? "blur(12px)" : "none",
            WebkitBackdropFilter: isDark ? "blur(12px)" : "none",
            animation: "toastSlideIn 0.25s ease-out forwards",
            pointerEvents: "auto",
            minWidth: 260,
            maxWidth: 340,
            transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={14} color={iconColor} />
          </div>
          <span
            style={{
              fontSize: 13,
              color: textColor,
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
              color: textSecColor,
              padding: 2,
              display: "flex",
              transition: "color 0.15s ease",
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
