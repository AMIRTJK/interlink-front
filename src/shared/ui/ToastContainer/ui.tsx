import { useSyncExternalStore } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useIsDarkMode } from "@shared/lib";
import {
  subscribeToasts,
  getToastsSnapshot,
  dismissToast,
  type ToastType,
} from "@shared/lib/toast";

// ─── Общий контейнер тостов ───────────────────────────────────────────────────
// Самодостаточный компонент: монтируется один раз в корне приложения (App) и
// показывает тосты из глобального хранилища (@shared/lib/toast). Любой код системы
// вызывает toast.success/error/info — здесь это отрисовывается. Поддерживает
// светлую и тёмную тему приложения (динамически переключается с помощью useIsDarkMode).

type VariantTheme = { color: string; bg: string };
type VariantConfig = { Icon: typeof CheckCircle; light: VariantTheme; dark: VariantTheme };

const VARIANTS: Record<ToastType, VariantConfig> = {
  success: {
    Icon: CheckCircle,
    light: { color: "#10B981", bg: "#ECFDF5" },
    dark: { color: "#34D399", bg: "rgba(16, 185, 129, 0.2)" },
  },
  error: {
    Icon: AlertCircle,
    light: { color: "#EF4444", bg: "#FEF2F2" },
    dark: { color: "#F87171", bg: "rgba(239, 68, 68, 0.2)" },
  },
  info: {
    Icon: Info,
    light: { color: "#3B82F6", bg: "#EFF6FF" },
    dark: { color: "#60A5FA", bg: "rgba(59, 130, 246, 0.2)" },
  },
  warning: {
    Icon: AlertTriangle,
    light: { color: "#F59E0B", bg: "#FFFBEB" },
    dark: { color: "#FBBF24", bg: "rgba(245, 158, 11, 0.2)" },
  },
};

const LIGHT_THEME = {
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  shadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  backdropFilter: "none",
};

const DARK_THEME = {
  surface: "rgba(15, 23, 42, 0.92)",
  border: "rgba(255, 255, 255, 0.12)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(12px)",
};

const FONT = "'Inter', sans-serif";

export function ToastContainer() {
  const isDark = useIsDarkMode();
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToastsSnapshot,
    getToastsSnapshot,
  );

  if (toasts.length === 0) return null;

  const themeStyles = isDark ? DARK_THEME : LIGHT_THEME;

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
        const variant = VARIANTS[t.type] ?? VARIANTS.info;
        const Icon = variant.Icon;
        const variantStyle = isDark ? variant.dark : variant.light;

        return (
          <div
            key={t.id}
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: themeStyles.surface,
              border: `1px solid ${themeStyles.border}`,
              borderRadius: 10,
              padding: "12px 16px",
              boxShadow: themeStyles.shadow,
              backdropFilter: themeStyles.backdropFilter,
              WebkitBackdropFilter: themeStyles.backdropFilter,
              animation: "toastSlideIn 0.25s ease-out forwards",
              pointerEvents: "auto",
              minWidth: 260,
              maxWidth: 360,
              transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: variantStyle.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={14} color={variantStyle.color} />
            </div>
            <span
              style={{
                fontSize: 13,
                color: themeStyles.textPrimary,
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
                color: themeStyles.textSecondary,
                padding: 2,
                display: "flex",
                flexShrink: 0,
                transition: "color 0.15s ease",
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
