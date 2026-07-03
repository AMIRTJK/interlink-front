import { Link, useLocation } from "react-router-dom";
import { Tooltip, Popover } from "antd";
import { Bell, LogOut, CheckCircle, Sun, Moon, Palette, Layers, MessageSquare, PanelTop, PanelLeft, PanelBottom, PanelRight, Monitor } from "lucide-react";
import { tokenControl, useLogout, useGetQuery } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { Logo } from "@shared/ui";
import { NotificationsPopover, useNotificationCounters } from "@features/notifications";
import { IUser } from "@entities/login";
import { ModuleMenu } from "./ModuleMenu";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { THEMES, BACKGROUNDS, LayoutMode } from "./designSettings";
import { useChat } from "@widgets/Chat";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DesktopMode } from "../../../features/Profile/ui/DesktopMode";

interface IProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode?: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
}

export const Header = ({
  currentTheme,
  setCurrentTheme,
  currentBg,
  setCurrentBg,
  layoutMode,
  setLayoutMode,
}: IProps) => {
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDesktopActive, setIsDesktopActive] = useState(false);
  const { pathname } = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { counters } = useNotificationCounters();
  const unreadCount = counters.unread;
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    tokenControl.getDarkMode(),
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const userId = tokenControl.getUserId();
  const { data: userResponse } = useGetQuery<{ data: IUser }>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: { enabled: !!userId, refetchOnWindowFocus: false, staleTime: Infinity },
  });
  const userData = (userResponse as { data?: IUser } | undefined)?.data ?? null;
  const userSubtitle =
    [userData?.position, userData?.organization?.name]
      .filter(Boolean)
      .join(" • ") || "—";

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      tokenControl.setDarkMode(newMode);
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const isProfilePage = pathname.includes("profile");
  const isVertical = layoutMode === "left" || layoutMode === "right";

  const themeContent = (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Выберите тему
      </p>
      <div className="space-y-2">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentTheme) {
                setCurrentTheme(key);
                localStorage.setItem("currentTheme", key);
                window.dispatchEvent(new StorageEvent("storage", { key: "currentTheme", newValue: key }));
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentTheme === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                theme.swatch || theme.gradient
              } shadow-lg flex-shrink-0`}
            />
            <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              {key}
            </span>
            {currentTheme === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const bgContent = (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Фон страницы
      </p>
      <div className="space-y-2">
        {Object.entries(BACKGROUNDS).map(([key, bg]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentBg) {
                setCurrentBg(key);
                localStorage.setItem("currentBg", key);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentBg === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                isDarkMode ? bg.dark : bg.light
              } border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm`}
            />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {bg.name}
            </span>
            {currentBg === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const layoutModes: { mode: LayoutMode; icon: React.ReactNode; title: string }[] = [
    { mode: "top", icon: <PanelTop size={16} />, title: "Верхнее меню" },
    { mode: "left", icon: <PanelLeft size={16} />, title: "Левое меню" },
    { mode: "bottom", icon: <PanelBottom size={16} />, title: "Нижнее меню" },
    { mode: "right", icon: <PanelRight size={16} />, title: "Правое меню" }
  ];

  const layoutContent = (
    <div className="w-[220px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Макет страницы
      </p>
      <div className="space-y-2">
        {layoutModes.map((item) => (
          <button
            key={item.mode}
            onClick={() => {
              if (setLayoutMode) {
                setLayoutMode(item.mode);
                localStorage.setItem("layoutMode", item.mode);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer text-sm font-semibold ${
              layoutMode === item.mode
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <span className="text-zinc-600 dark:text-zinc-300 flex-shrink-0">
              {item.icon}
            </span>
            <span className="text-zinc-700 dark:text-zinc-200">
              {item.title}
            </span>
            {layoutMode === item.mode && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <header
      className={`sticky z-50 bg-white/40 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 dark:border-slate-700/50 shadow-lg transition-all duration-300 ease-in-out rounded-none ${
        layoutMode === "bottom" ? "bottom-0" : "top-0"
      } ${
        isVertical
          ? "h-screen w-60 flex flex-col! items-stretch! justify-start! gap-6! px-4! py-6!"
          : "w-full flex items-center justify-between gap-4 px-6 py-3"
      }`}
    >
      <div className={`flex items-center gap-4 min-w-0 ${isVertical ? "flex-col! items-center! text-center! w-full!" : ""}`}>
        <Link
          to={AppRoutes.PROFILE}
          aria-label="На главную"
          className={`flex items-center gap-3 focus:outline-none rounded-lg shrink-0 ${
            isVertical ? "flex-col! text-center!" : ""
          }`}
        >
          <Logo
            className={`text-base sm:text-lg md:text-xl text-zinc-900 dark:text-white ${isVertical ? "block!" : ""}`}
          />
        </Link>

        <div className={`hidden md:flex items-center gap-3 pl-4 border-l border-zinc-900/10 dark:border-zinc-700/40 min-w-0 ${
          isVertical ? "flex flex-col! items-center! gap-2! pl-0! border-l-0! border-t! pt-4! w-full!" : ""
        }`}>
          <div className="relative shrink-0">
            <img
              src={userData?.photo_path || userAvatar}
              alt="Аватар пользователя"
              className="w-11 h-11 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg" />
          </div>
          <div className={`leading-tight min-w-0 ${isVertical ? "text-center!" : ""}`}>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
              {userData?.full_name || "—"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
              {userSubtitle}
            </p>
          </div>
        </div>
      </div>

      <ModuleMenu variant="header" isVertical={isVertical} />

      <div className={`flex items-center gap-2 shrink-0 ${isVertical ? "flex-col! items-center! gap-3! mt-auto! w-full!" : ""}`}>
        <div className={`flex items-center gap-2 ${isVertical ? "flex-col! gap-3!" : ""}`}>
          <Popover
            content={<NotificationsPopover open={notifOpen} />}
            open={notifOpen}
            onOpenChange={setNotifOpen}
            trigger="click"
            placement={isVertical ? "rightBottom" : "bottomRight"}
            arrow={false}
            overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
          >
            <button
              aria-label="Уведомления"
              className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <Bell size={18} strokeWidth={2.2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Popover>

          <Tooltip title="Чат" placement={isVertical ? "right" : "bottom"}>
            <button
              onClick={openChat}
              aria-label="Открыть чат"
              className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <MessageSquare size={18} strokeWidth={2.2} />
            </button>
          </Tooltip>

          <Tooltip title="Рабочий стол" placement={isVertical ? "right" : "bottom"}>
            <button
              onClick={() => setIsDesktopActive(true)}
              aria-label="Рабочий стол"
              className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <Monitor size={18} strokeWidth={2.2} />
            </button>
          </Tooltip>

          <Tooltip
            title={isDarkMode ? "Светлая тема" : "Темная тема"}
            placement={isVertical ? "right" : "bottom"}
          >
            <button
              onClick={toggleTheme}
              aria-label="Смена темы"
              className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              {isDarkMode ? (
                <Sun size={18} strokeWidth={2.2} />
              ) : (
                <Moon size={18} strokeWidth={2.2} />
              )}
            </button>
          </Tooltip>
        </div>

        <div
          className={`${isVertical ? "w-full! h-px!" : "w-px! h-6!"} bg-white/30 dark:bg-zinc-700/40 mx-1`}
          aria-hidden="true"
        />

        {isProfilePage && (
          <>
            <Popover
              content={themeContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button
                aria-label="Выбор темы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                <Palette size={18} strokeWidth={2.2} />
              </button>
            </Popover>

            <Popover
              content={bgContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button
                aria-label="Фон страницы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                <Layers size={18} strokeWidth={2.2} />
              </button>
            </Popover>

            <Popover
              content={layoutContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button
                aria-label="Макет страницы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                {layoutMode === "top" && <PanelTop size={18} strokeWidth={2.2} />}
                {layoutMode === "left" && <PanelLeft size={18} strokeWidth={2.2} />}
                {layoutMode === "bottom" && <PanelBottom size={18} strokeWidth={2.2} />}
                {layoutMode === "right" && <PanelRight size={18} strokeWidth={2.2} />}
              </button>
            </Popover>
          </>
        )}

        <Tooltip title="Выйти" placement={isVertical ? "right" : "bottomRight"}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Выход"
            className="flex items-center gap-2 py-2 px-4 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={16} strokeWidth={2.2} />
            <span className={isVertical ? "hidden!" : "hidden sm:inline"}>Выход</span>
          </button>
        </Tooltip>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <AnimatePresence>
        {isDesktopActive && (
          <DesktopMode
            userData={userData}
            onClose={() => setIsDesktopActive(false)}
            isDark={isDarkMode}
          />
        )}
      </AnimatePresence>
    </header>
  );
};
