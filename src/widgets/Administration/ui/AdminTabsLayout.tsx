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
      className="-mx-6 -mt-4 -mb-4 w-[calc(100%+3rem)] flex-1 flex flex-col min-h-0"
      style={{
        fontFamily: T.font,
      }}
    >
      {/* Tab bar */}
      <div
        className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 h-12 flex items-center pl-6 shrink-0"
      >
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.key || pathname.startsWith(tab.key + "/");
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              className={`px-4 h-full border-0 bg-transparent cursor-pointer text-sm transition-colors border-b-2 ${
                isActive
                  ? "font-semibold text-slate-900 dark:text-white border-blue-500"
                  : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              style={{ fontFamily: T.font }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
