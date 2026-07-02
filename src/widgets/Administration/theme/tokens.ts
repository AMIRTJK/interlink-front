// Дизайн-токены и стиль-константы, перенесённые из референса
// src/widgets/NewDesignAccess/src/components/generated/IAMDashboard.tsx
// Верстка/стили перенесены дословно; шрифт Inter самохостится (@fontsource/inter),
// поэтому CDN @import из ensureStyles убран — остались только keyframes.
import type * as React from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
export const T = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  sidebar: "#0F172A",
  accent: "#3B82F6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  hoverBg: "#F1F5F9",
  shadow: "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
  shadowXl: "0 20px 60px rgba(0,0,0,0.15)",
  font: "'Inter', sans-serif",
} as const;

// ── CSS keyframes ─────────────────────────────────────────────────────────────
const STYLE_ID = "iam-keyframes";
export function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes drawerSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes contentFadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
    @keyframes contentFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes permRowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cardPulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); } 60% { box-shadow: 0 0 0 6px rgba(59,130,246,0); } 100% { box-shadow: 0 4px 16px rgba(59,130,246,0.12); } }
    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes toastSlideIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fieldsSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .ant-select-selection-placeholder { color: #94A3B8 !important; }
    .admin__search-input::placeholder { color: #94A3B8 !important; opacity: 1 !important; }
    .admin__select {
      border: 1px solid #E2E8F0 !important;
      border-radius: 8px !important;
      padding: 0 12px !important;
      height: 36px !important;
      background: #FFFFFF !important;
      font-size: 13px !important;
      font-family: 'Inter', sans-serif !important;
      outline: none !important;
      cursor: pointer !important;
      appearance: none !important;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 8px center !important;
      background-size: 14px !important;
      padding-right: 28px !important;
      box-sizing: border-box !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
    }
    .admin__select:hover {
      border-color: #3B82F6 !important;
    }
    .admin__select:focus {
      border-color: #3B82F6 !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15) !important;
    }
    .admin__more-btn {
      background: none !important;
      border: none !important;
      cursor: pointer !important;
      color: #64748B !important;
      padding: 6px !important;
      border-radius: 6px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: background 0.15s, color 0.15s !important;
    }
    .admin__more-btn:hover {
      background: #F1F5F9 !important;
      color: #0F172A !important;
    }
    .admin__more-btn--active {
      background: #F1F5F9 !important;
      color: #0F172A !important;
    }
  `;
  document.head.appendChild(style);
}

// ── Role colors (генерик: имя роли — произвольная строка) ──────────────────────
// Базовая палитра из дизайна для канонических ролей СЭД + запасные цвета,
// назначаемые детерминированно по имени, чтобы новые роли тоже были окрашены.
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  "Администратор системы": { bg: "#EFF6FF", text: "#3B82F6" },
  Делопроизводитель: { bg: "#ECFDF5", text: "#10B981" },
  Руководитель: { bg: "#FFF7ED", text: "#F59E0B" },
  Исполнитель: { bg: "#EFF6FF", text: "#3B82F6" },
  "Контролёр": { bg: "#F5F3FF", text: "#8B5CF6" },
  Наблюдатель: { bg: "#F1F5F9", text: "#64748B" },
};

const DEFAULT_ROLE_COLOR = { bg: "#F1F5F9", text: "#64748B" };

// Палитра для ролей вне канонического набора — стабильно по хэшу имени
const FALLBACK_ROLE_PALETTE: { bg: string; text: string }[] = [
  { bg: "#EFF6FF", text: "#3B82F6" },
  { bg: "#ECFDF5", text: "#10B981" },
  { bg: "#FFF7ED", text: "#F59E0B" },
  { bg: "#F5F3FF", text: "#8B5CF6" },
  { bg: "#FEF2F2", text: "#EF4444" },
  { bg: "#F0FDFA", text: "#14B8A6" },
  { bg: "#FDF2F8", text: "#EC4899" },
  { bg: "#F1F5F9", text: "#64748B" },
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Сопоставление по смыслу названия (рус/англ) — соответствует getRoleColorMeta
// из Hr/Access/lib.tsx, чтобы цвета совпадали с остальным приложением.
function semanticRoleColor(role: string): { bg: string; text: string } | null {
  const name = role.toLowerCase();
  if (name.includes("администратор") || name.includes("admin"))
    return { bg: "#EFF6FF", text: "#3B82F6" };
  if (name.includes("делопроизводитель") || name.includes("recipient"))
    return { bg: "#ECFDF5", text: "#10B981" };
  if (name.includes("руководитель") || name.includes("signer"))
    return { bg: "#FFF7ED", text: "#F59E0B" };
  if (name.includes("исполнитель") || name.includes("approval"))
    return { bg: "#EFF6FF", text: "#3B82F6" };
  if (name.includes("контрол") || name.includes("control"))
    return { bg: "#F5F3FF", text: "#8B5CF6" };
  if (name.includes("наблюдатель") || name.includes("observer"))
    return { bg: "#F1F5F9", text: "#64748B" };
  return null;
}

export function getRoleColor(role: string): { bg: string; text: string } {
  if (!role) return DEFAULT_ROLE_COLOR;
  if (ROLE_COLORS[role]) return ROLE_COLORS[role];
  const semantic = semanticRoleColor(role);
  if (semantic) return semantic;
  return FALLBACK_ROLE_PALETTE[hashString(role) % FALLBACK_ROLE_PALETTE.length];
}

export function getRoleBorderColor(role: string): string {
  return getRoleColor(role).text;
}

// ── Status configs ────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<string, { dot: string }> = {
  "Активен": { dot: "#10B981" },
  "Неактивен": { dot: "#94A3B8" },
  "Заблокирован": { dot: "#EF4444" },
  "В отпуске": { dot: "#F59E0B" },
  "В командировке": { dot: "#3B82F6" },
};

export const EXT_STATUS_CFG: Record<string, { dot: string; label: string }> = {
  "Активен": { dot: "#10B981", label: "Активен" },
  "Неактивен": { dot: "#94A3B8", label: "Неактивен" },
  "Заблокирован": { dot: "#EF4444", label: "Заблокирован" },
  "В отпуске": { dot: "#F59E0B", label: "В отпуске" },
  "В командировке": { dot: "#3B82F6", label: "В командировке" },
};

// ── Style constants (перенесены из IAMDashboard) ──────────────────────────────
export const thStyle: React.CSSProperties = {
  padding: "0 12px",
  height: 44,
  fontSize: 11,
  fontWeight: 600,
  color: T.textSecondary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
  textAlign: "center",
  background: T.bg,
};
export const tdStyle: React.CSSProperties = {
  padding: "0 12px",
  height: 56,
  verticalAlign: "middle",
  textAlign: "center",
};
export const paginBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: "transparent",
  color: T.textSecondary,
  fontSize: 13,
  fontFamily: T.font,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: T.textPrimary,
  marginBottom: 5,
  fontFamily: T.font,
};
export const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "0 11px",
  height: 36,
  fontSize: 13,
  color: T.textPrimary,
  fontFamily: T.font,
  outline: "none",
  background: T.surface,
  boxSizing: "border-box",
  display: "block",
};
export const primaryBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 20px",
  height: 36,
  borderRadius: 8,
  border: "none",
  background: T.accent,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: T.font,
};
export const cancelBtnStyle: React.CSSProperties = {
  padding: "0 18px",
  height: 36,
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  background: "transparent",
  color: T.textPrimary,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: T.font,
};
