import React, { useState, useEffect } from "react";
import { Popover, Tooltip } from "antd";
import { AnimatePresence } from "framer-motion";
import { Bell, LogOut, Sun, Moon, Palette, Layers, MessageSquare, Monitor, PanelTop, PanelLeft, PanelBottom, PanelRight } from "lucide-react";
import { tokenControl, useLogout } from "@shared/lib";
import { NotificationsPopover, useNotificationCounters } from "@features/notifications";
import { useChat } from "@widgets/Chat";
import { If, Logo } from "@shared/ui";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DesktopMode } from "../../../features/Profile/ui/DesktopMode";
import { LayoutMode } from "./designSettings";
import { useLayoutMode, useMoveHeader } from "./useLayoutMode";
import { useDesignSettings } from "./useDesignSettings";
import { useProfileUser } from "./useProfileUser";
import { ThemeContent, BgContent, LayoutContent } from "./designPopovers";
import { ModuleMenu } from "./ModuleMenu";
import { getEnvVar } from "@shared/config";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { Link } from "react-router-dom";
import { AppRoutes } from "@shared/config";

const resolvePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  return `${host}${path.startsWith("/") ? path : `/${path}`}`;
};

const layoutModes: { mode: LayoutMode; icon: React.ReactNode; title: string }[] = [
  { mode: "top", icon: <PanelTop size={16} />, title: "Верхнее меню" },
  { mode: "left", icon: <PanelLeft size={16} />, title: "Левое меню" },
  { mode: "bottom", icon: <PanelBottom size={16} />, title: "Нижнее меню" },
  { mode: "right", icon: <PanelRight size={16} />, title: "Правое меню" }
];

export const BottomNav = () => {
  const [moveHeader, setMoveHeader] = useMoveHeader();
  const { userData, userName, userSubtitle } = useProfileUser();
  const [avatarError, setAvatarError] = useState(false);
  const { currentTheme, setCurrentTheme, currentBg, setCurrentBg } = useDesignSettings();
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => tokenControl.getDarkMode());
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDesktopActive, setIsDesktopActive] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { counters } = useNotificationCounters();
  const unreadCount = counters.unread;

  useEffect(() => { setAvatarError(false); }, [userData?.photo_url, userData?.photo_path]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      tokenControl.setDarkMode(next);
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[90] border-t border-white/20 dark:border-zinc-700/30 backdrop-blur-3xl bg-white/40 dark:bg-zinc-900/40 transition-all duration-300 ease-in-out ${moveHeader ? "px-6 py-4 shadow-lg flex items-center justify-between gap-4" : "h-14 px-4 flex items-center justify-center"}`}>
      <If is={!moveHeader}>
        <ModuleMenu variant="header" navLayout="bottom" />
      </If>
      <If is={moveHeader}>
        <div className="flex items-center gap-6 min-w-0">
          <Link to={AppRoutes.PROFILE} className="flex items-center gap-3 focus:outline-none rounded-lg shrink-0">
            <Logo className="text-base sm:text-lg md:text-xl text-zinc-900 dark:text-white" />
          </Link>
          <div className="hidden md:flex items-center gap-4 min-w-0 pl-6 border-l border-zinc-900/10 dark:border-zinc-700/40">
            <div className="relative shrink-0">
              <img
                src={avatarError ? userAvatar : (userData?.photo_url || resolvePhotoUrl(userData?.photo_path) || userAvatar)}
                alt="Аватар"
                className="w-11 h-11 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
                onError={() => setAvatarError(true)}
              />
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg animate-live-breathe" />
              </span>
            </div>
            <div className="leading-tight min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">{userName}</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 truncate max-w-[220px]">{userSubtitle}</p>
            </div>
          </div>
        </div>
        <ModuleMenu variant="header" navLayout="top" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Popover
              content={<NotificationsPopover open={notifOpen} />}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              trigger="click"
              placement="topRight"
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <Tooltip title="Уведомления" placement="top">
                <button aria-label="Уведомления" className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                  <Bell size={18} strokeWidth={2.2} />
                  <If is={unreadCount > 0}>
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  </If>
                </button>
              </Tooltip>
            </Popover>
            <Tooltip title="Чат" placement="top">
              <button onClick={openChat} aria-label="Чат" className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <MessageSquare size={18} strokeWidth={2.2} />
              </button>
            </Tooltip>
            <Tooltip title="Рабочий стол" placement="top">
              <button onClick={() => setIsDesktopActive(true)} aria-label="Рабочий стол" className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Monitor size={18} strokeWidth={2.2} />
              </button>
            </Tooltip>
            <Tooltip title={isDarkMode ? "Светлая" : "Темная"} placement="top">
              <button onClick={toggleTheme} aria-label="Смена темы" className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <If is={isDarkMode}><Sun size={18} strokeWidth={2.2} /></If>
                <If is={!isDarkMode}><Moon size={18} strokeWidth={2.2} /></If>
              </button>
            </Tooltip>
          </div>
          <div className="w-px! h-6! bg-white/30 dark:bg-zinc-700/40 mx-1" aria-hidden="true" />
          <Popover
            content={<ThemeContent currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
            trigger="click"
            placement="topRight"
            arrow={false}
            overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
          >
            <Tooltip title="Выберите тему" placement="top">
              <button aria-label="Тема" className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Palette size={18} strokeWidth={2.2} />
              </button>
            </Tooltip>
          </Popover>
          <Popover
            content={<BgContent currentBg={currentBg} setCurrentBg={setCurrentBg} isDarkMode={isDarkMode} />}
            trigger="click"
            placement="topRight"
            arrow={false}
            overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
          >
            <Tooltip title="Фон страницы" placement="top">
              <button aria-label="Фон" className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Layers size={18} strokeWidth={2.2} />
              </button>
            </Tooltip>
          </Popover>
          <Popover
            content={<LayoutContent layoutMode={layoutMode} setLayoutMode={setLayoutMode} moveHeader={moveHeader} setMoveHeader={setMoveHeader} layoutModes={layoutModes} />}
            trigger="click"
            placement="topRight"
            arrow={false}
            overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
          >
            <Tooltip title="Макет страницы" placement="top">
              <button aria-label="Макет" className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <If is={layoutMode === "top"}><PanelTop size={18} strokeWidth={2.2} /></If>
                <If is={layoutMode === "left"}><PanelLeft size={18} strokeWidth={2.2} /></If>
                <If is={layoutMode === "bottom"}><PanelBottom size={18} strokeWidth={2.2} /></If>
                <If is={layoutMode === "right"}><PanelRight size={18} strokeWidth={2.2} /></If>
              </button>
            </Tooltip>
          </Popover>
          <Tooltip title="Выйти" placement="topRight">
            <button onClick={() => setShowLogoutConfirm(true)} aria-label="Выход" className="flex items-center gap-2 py-2 px-4 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none">
              <LogOut size={16} strokeWidth={2.2} />
              <span className="hidden sm:inline">Выход</span>
            </button>
          </Tooltip>
        </div>
      </If>
      <LogoutConfirmModal open={showLogoutConfirm} onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />
      <AnimatePresence>
        <If is={isDesktopActive}>
          <DesktopMode userData={userData} onClose={() => setIsDesktopActive(false)} isDark={isDarkMode} />
        </If>
      </AnimatePresence>
    </div>
  );
};
