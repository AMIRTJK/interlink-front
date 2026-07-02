// Верхний таб-бар подмодулей «Пользователи | Роли и доступы» (порт из IAMDashboard.tsx)
// + <Outlet/> для вложенных страниц. Переключение через навигацию.
import * as React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { T, ensureStyles } from "../theme/tokens";

const TABS = [
  { key: AppRoutes.ADMINISTRATION_USERS, label: "Пользователи" },
  { key: AppRoutes.ADMINISTRATION_ROLES, label: "Роли и доступы" },
] as const;

export function AdminTabsLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    ensureStyles();
  }, []);

  return (
    <div
      style={{
        fontFamily: T.font,
        background: T.bg,
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          height: 48,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.key || pathname.startsWith(tab.key + "/");
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              style={{
                padding: "0 16px",
                height: "100%",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? T.textPrimary : T.textSecondary,
                fontFamily: T.font,
                borderBottom: isActive
                  ? `2px solid ${T.accent}`
                  : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 24, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>
    </div>
  );
}
