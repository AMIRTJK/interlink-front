import type { ReactNode } from "react";
import { Tooltip } from "antd";
import { AppRoutes } from "@shared/config/AppRoutes";
import { User, Mail, Users, Layout, ShieldCheck, ClipboardList } from "lucide-react";
import { THEMES } from "../designSettings";
import { useDesignSettings } from "../useDesignSettings";
import type { MenuItem } from "./lib";

interface IHeaderNavProps {
  menuItems: MenuItem[];
  pathname: string;
  navLayout: "top" | "sidebar" | "bottom";
  collapsed?: boolean;
  onNavigate: (path: string) => void;
}

export const ModuleMenuHeader = ({
  menuItems,
  pathname,
  navLayout,
  collapsed,
  onNavigate,
}: IHeaderNavProps) => {
  const { currentTheme } = useDesignSettings();
  const activeGradient =
    THEMES[currentTheme]?.gradient || THEMES.emerald.gradient;

  const headerIcon: Record<string, ReactNode> = {
    [AppRoutes.PROFILE]: <User size={18} />,
    [AppRoutes.CORRESPONDENCE]: <Mail size={18} />,
    [AppRoutes.HR]: <Users size={18} />,
    [AppRoutes.TASKS]: <ClipboardList size={18} />,
    [AppRoutes.ADMINISTRATION]: <ShieldCheck size={18} />,
  };

  const navClass =
    navLayout === "sidebar"
      ? "flex flex-col items-stretch w-full gap-1.5"
      : navLayout === "bottom"
        ? "flex items-center justify-center gap-1 sm:gap-3 overflow-x-auto"
        : "flex items-center gap-2";

  return (
    <nav className={navClass}>
      {menuItems.map((item) => {
        if (!item || !("key" in item)) return null;
        const itemKey = String(item.key);
        const isActive =
          pathname === itemKey || pathname.startsWith(itemKey + "/");
        const label = "label" in item ? item.label : "";
        const labelText = typeof label === "string" ? label : undefined;
        const icon = headerIcon[itemKey] ?? <Layout size={18} />;

        // Нижнее меню: иконка над подписью
        if (navLayout === "bottom") {
          return (
            <button
              key={itemKey}
              onClick={() => onNavigate(itemKey)}
              title={labelText}
              className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-2xl min-w-[72px] transition-all ${
                isActive
                  ? `bg-linear-to-br ${activeGradient} text-white shadow-md`
                  : "text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span className="shrink-0">{icon}</span>
              <span className="text-[11px] font-bold leading-none truncate max-w-[72px]">
                {label}
              </span>
            </button>
          );
        }

        // Боковое меню: иконка + подпись (в свёрнутом виде — только иконка)
        if (navLayout === "sidebar") {
          return (
            <button
              key={itemKey}
              onClick={() => onNavigate(itemKey)}
              title={labelText}
              className={`relative flex items-center gap-3 rounded-[2.5rem] text-sm font-semibold transition-all ${
                collapsed ? "justify-center px-0 py-3" : "px-4 py-3"
              } ${
                isActive
                  ? `bg-linear-to-r ${activeGradient} text-white shadow-md`
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-zinc-800/40"
              }`}
            >
              <span className="shrink-0">{icon}</span>
              {!collapsed && (
                <span className="truncate text-left leading-tight min-w-0">
                  {label}
                </span>
              )}
            </button>
          );
        }

        // Верхнее меню: только иконки, название — во всплывающей подсказке
        return (
          <Tooltip key={itemKey} title={labelText} placement="bottom">
            <button
              onClick={() => onNavigate(itemKey)}
              aria-label={labelText}
              className={`p-2.5 rounded-[2.5rem] transition-all ${
                isActive
                  ? `bg-linear-to-r ${activeGradient} text-white shadow-md`
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-zinc-800/30"
              }`}
            >
              {icon}
            </button>
          </Tooltip>
        );
      })}
    </nav>
  );
};
