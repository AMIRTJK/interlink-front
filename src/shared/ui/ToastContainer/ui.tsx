import { useSyncExternalStore } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import {
  subscribeToasts,
  getToastsSnapshot,
  dismissToast,
  type ToastType,
} from "@shared/lib/toast";

// ─── Общий контейнер тостов ───────────────────────────────────────────────────
// Самодостаточный компонент: монтируется один раз в корне приложения (App) и
// показывает тосты из глобального хранилища (@shared/lib/toast). Любой код системы
// вызывает toast.success/error/info — здесь это отрисовывается. Стиль перенесён из
// дизайна раздела «Администрирование» и расширен вариантами success/error/info/warning.

type Variant = { Icon: typeof CheckCircle; color: string; bg: string };

const VARIANTS: Record<ToastType, Variant> = {
  success: { Icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
  error: { Icon: AlertCircle, color: "#EF4444", bg: "#FEF2F2" },
  info: { Icon: Info, color: "#3B82F6", bg: "#EFF6FF" },
  warning: { Icon: AlertTriangle, color: "#F59E0B", bg: "#FFFBEB" },
};

const SURFACE = "#FFFFFF";
const BORDER = "#E2E8F0";
const TEXT_PRIMARY = "#0F172A";
const TEXT_SECONDARY = "#64748B";
const SHADOW_MD = "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)";
const FONT = "'Inter', sans-serif";

export function ToastContainer() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToastsSnapshot,
    getToastsSnapshot,
  );

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const { Icon, color, bg } = VARIANTS[t.type] ?? VARIANTS.info;
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: "12px 16px",
              boxShadow: SHADOW_MD,
              animation: "toastSlideIn 0.25s ease-out forwards",
              pointerEvents: "auto",
              minWidth: 260,
              maxWidth: 360,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={14} color={color} />
            </div>
            <span
              style={{
                fontSize: 13,
                color: TEXT_PRIMARY,
                fontWeight: 500,
                fontFamily: FONT,
                flex: 1,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Закрыть"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: TEXT_SECONDARY,
                padding: 2,
                display: "flex",
                flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
