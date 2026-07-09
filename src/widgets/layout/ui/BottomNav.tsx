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
  const { userData } = useProfileUser();
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

  useEffect(() => { setAvatarError(false); }, [userData?.photo_path]);

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
    <div className="fixed bottom-0 left-0 right-0 z-[90] h-14 border-t border-white/20 dark:border-zinc-700/30 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 transition-all duration-300 ease-in-out">
      <If is={!moveHeader}>
        <div className="h-full px-4 flex items-center justify-center">
          <ModuleMenu variant="header" navLayout="bottom" />
        </div>
      </If>
      <If is={moveHeader}>
        <div className="h-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Logo className="text-sm text-zinc-900 dark:text-white" />
            <div className="relative shrink-0">
              <img
                src={avatarError ? userAvatar : (resolvePhotoUrl(userData?.photo_path) || userAvatar)}
                alt="Аватар"
                className="w-8 h-8 rounded-full border border-white/60 dark:border-zinc-900/60 object-cover shadow-md"
                onError={() => setAvatarError(true)}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-900" />
            </div>
          </div>
          <div className="flex-1 flex justify-center min-w-0">
            <ModuleMenu variant="header" navLayout="bottom" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Popover
              content={<NotificationsPopover open={notifOpen} />}
              open={notifOpen}
              onOpenChange={setNotifOpen}
              trigger="click"
              placement="topRight"
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button aria-label="Уведомления" className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Bell size={14} strokeWidth={2.2} />
                <If is={unreadCount > 0}>
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 bg-rose-500 text-[8px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </If>
              </button>
            </Popover>
            <Tooltip title="Чат" placement="top">
              <button onClick={openChat} aria-label="Чат" className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <MessageSquare size={14} strokeWidth={2.2} />
              </button>
            </Tooltip>
            <Tooltip title="Рабочий стол" placement="top">
              <button onClick={() => setIsDesktopActive(true)} aria-label="Рабочий стол" className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Monitor size={14} strokeWidth={2.2} />
              </button>
            </Tooltip>
            <Tooltip title={isDarkMode ? "Светлая" : "Темная"} placement="top">
              <button onClick={toggleTheme} aria-label="Смена темы" className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <If is={isDarkMode}><Sun size={14} strokeWidth={2.2} /></If>
                <If is={!isDarkMode}><Moon size={14} strokeWidth={2.2} /></If>
              </button>
            </Tooltip>
            <Popover
              content={<ThemeContent currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
              trigger="click"
              placement="topRight"
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button aria-label="Тема" className="p-2 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Palette size={14} strokeWidth={2.2} />
              </button>
            </Popover>
            <Popover
              content={<BgContent currentBg={currentBg} setCurrentBg={setCurrentBg} isDarkMode={isDarkMode} />}
              trigger="click"
              placement="topRight"
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button aria-label="Фон" className="p-2 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <Layers size={14} strokeWidth={2.2} />
              </button>
            </Popover>
            <Popover
              content={<LayoutContent layoutMode={layoutMode} setLayoutMode={setLayoutMode} moveHeader={moveHeader} setMoveHeader={setMoveHeader} layoutModes={layoutModes} />}
              trigger="click"
              placement="topRight"
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
            >
              <button aria-label="Макет" className="p-2 rounded-full bg-white/30 dark:bg-zinc-800/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none">
                <If is={layoutMode === "top"}><PanelTop size={14} strokeWidth={2.2} /></If>
                <If is={layoutMode === "left"}><PanelLeft size={14} strokeWidth={2.2} /></If>
                <If is={layoutMode === "bottom"}><PanelBottom size={14} strokeWidth={2.2} /></If>
                <If is={layoutMode === "right"}><PanelRight size={14} strokeWidth={2.2} /></If>
              </button>
            </Popover>
            <Tooltip title="Выйти" placement="topRight">
              <button onClick={() => setShowLogoutConfirm(true)} aria-label="Выход" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-zinc-800/30 border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none">
                <LogOut size={12} strokeWidth={2.2} />
              </button>
            </Tooltip>
          </div>
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
