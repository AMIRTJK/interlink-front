import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout, PanelTop, ChevronLeft, ChevronRight } from "lucide-react";
import { AppRoutes } from "@shared/config";
import { Logo } from "@shared/ui";
import { ModuleMenu } from "./ModuleMenu";
import { LayoutMode } from "./designSettings";
import { useProfileUser } from "./useProfileUser";
import userAvatar from "../../../assets/images/user-avatar.jpg";

interface IProps {
  /** С какой стороны расположена панель — влияет на положение кнопки сворачивания. */
  side: "left" | "right";
  setLayoutMode?: (layout: LayoutMode) => void;
  /** Градиент активной темы для логотипа. */
  themeGradient: string;
}

/**
 * Боковая навигационная панель личного кабинета (режимы «Левое меню» / «Правое меню»).
 *
 * Содержит: логотип, навигацию по модулям, а внизу — аватар и ФИО пользователя
 * и кнопку «Верхнее меню» для возврата к стандартной раскладке. Системные кнопки
 * (уведомления, чат, тема и т.д.) остаются в верхнем хедере — они здесь не дублируются.
 */
export const Sidebar = ({ side, setLayoutMode, themeGradient }: IProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const { userData, userName, userSubtitle } = useProfileUser();
  const isLeft = side === "left";

  const backToTop = () => {
    if (setLayoutMode) {
      setLayoutMode("top");
      localStorage.setItem("layoutMode", "top");
    }
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-[256px]"
      } shrink-0 self-start sticky top-4 transition-all duration-300 ease-in-out`}
    >
      <div className="relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-zinc-700/30 shadow-lg flex flex-col h-[calc(100vh-2rem)] py-5 transition-all duration-300 ease-in-out">
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Развернуть" : "Свернуть"}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          className={`absolute ${
            isLeft ? "-right-3" : "-left-3"
          } top-8 z-20 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-white/40 dark:border-zinc-700/50 shadow-md flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer`}
        >
          {isLeft ? (
            collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )
          ) : collapsed ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {/* Логотип */}
        <Link
          to={AppRoutes.PROFILE}
          aria-label="На главную"
          className={`flex items-center gap-3 px-4 mb-6 focus:outline-none ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <div
            className={`w-10 h-10 bg-linear-to-br ${themeGradient} rounded-[2.5rem] flex items-center justify-center shadow-lg shrink-0`}
          >
            <Layout className="text-white" size={20} />
          </div>
          {!collapsed && (
            <Logo
              className="text-base text-zinc-900 dark:text-white"
              style={{ letterSpacing: "0.15em" }}
            />
          )}
        </Link>

        {/* Навигация по модулям */}
        <div className="flex-1 px-3 overflow-y-auto">
          <ModuleMenu variant="header" navLayout="sidebar" collapsed={collapsed} />
        </div>

        {/* Пользователь + возврат к верхнему меню */}
        <div className="px-3 pt-4 mt-2 border-t border-white/20 dark:border-zinc-700/30 flex flex-col gap-2">
          <div
            className={`flex items-center gap-3 px-1 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={userData?.photo_path || userAvatar}
                alt="Аватар пользователя"
                className="w-10 h-10 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {userName}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {userSubtitle}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={backToTop}
            title="Верхнее меню"
            className={`flex items-center gap-3 rounded-[2.5rem] text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-all cursor-pointer ${
              collapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"
            }`}
          >
            <PanelTop size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Верхнее меню</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
