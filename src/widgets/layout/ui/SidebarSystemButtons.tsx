import React, { useState } from "react";
import { Popover, Tooltip } from "antd";
import { AnimatePresence } from "framer-motion";
import {
  Bell,
  LogOut,
  Sun,
  Moon,
  Palette,
  Layers,
  MessageSquare,
  Monitor,
  PanelTop,
  PanelLeft,
  PanelBottom,
  PanelRight,
} from "lucide-react";
import { tokenControl, useLogout } from "@shared/lib";
import { NotificationsPopover, useNotificationCounters } from "@features/notifications";
import { useChat } from "@widgets/Chat";
import { If } from "@shared/ui";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DesktopMode } from "../../../features/Profile/ui/DesktopMode";
import { LayoutMode } from "./designSettings";
import { useLayoutMode, useMoveHeader } from "./useLayoutMode";
import { useDesignSettings } from "./useDesignSettings";
import { useProfileUser } from "./useProfileUser";
import { ThemeContent, BgContent, LayoutContent } from "./designPopovers";

interface IProps {
  collapsed: boolean;
}

export const SidebarSystemButtons = ({ collapsed }: IProps) => {
  const { userData } = useProfileUser();
  const { currentTheme, setCurrentTheme, currentBg, setCurrentBg } = useDesignSettings();
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [moveHeader, setMoveHeader] = useMoveHeader();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => tokenControl.getDarkMode());
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDesktopActive, setIsDesktopActive] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { counters } = useNotificationCounters();
  const unreadCount = counters.unread;

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

  const layoutModes: { mode: LayoutMode; icon: React.ReactNode; title: string }[] = [
    { mode: "top", icon: <PanelTop size={16} />, title: "Верхнее меню" },
    { mode: "left", icon: <PanelLeft size={16} />, title: "Левое меню" },
    { mode: "bottom", icon: <PanelBottom size={16} />, title: "Нижнее меню" },
    { mode: "right", icon: <PanelRight size={16} />, title: "Правое меню" },
  ];

  return (
    <>
      <div className={`flex ${collapsed ? "flex-col items-center gap-2" : "grid grid-cols-4 gap-2"} px-1 mb-2`}>
        <Popover
          content={<NotificationsPopover open={notifOpen} />}
          open={notifOpen}
          onOpenChange={setNotifOpen}
          trigger="click"
          placement={collapsed ? "right" : "top"}
          arrow={false}
          overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
        >
          <Tooltip title="Уведомления" placement={collapsed ? "right" : "top"}>
            <button
              aria-label="Уведомления"
              className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <Bell size={18} strokeWidth={2.2} />
              <If is={unreadCount > 0}>
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </If>
            </button>
          </Tooltip>
        </Popover>

        <Tooltip title="Чат" placement={collapsed ? "right" : "top"}>
          <button
            onClick={openChat}
            aria-label="Открыть чат"
            className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <MessageSquare size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>

        <Tooltip title="Рабочий стол" placement={collapsed ? "right" : "top"}>
          <button
            onClick={() => setIsDesktopActive(true)}
            aria-label="Рабочий стол"
            className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <Monitor size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>

        <Tooltip title={isDarkMode ? "Светлая тема" : "Темная тема"} placement={collapsed ? "right" : "top"}>
          <button
            onClick={toggleTheme}
            aria-label="Смена темы"
            className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <If is={isDarkMode}>
              <Sun size={18} strokeWidth={2.2} />
            </If>
            <If is={!isDarkMode}>
              <Moon size={18} strokeWidth={2.2} />
            </If>
          </button>
        </Tooltip>

        <Popover
          content={<ThemeContent currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />}
          trigger="click"
          placement={collapsed ? "right" : "top"}
          arrow={false}
          overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
        >
          <Tooltip title="Выберите тему" placement={collapsed ? "right" : "top"}>
            <button
              aria-label="Выбор темы"
              className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <Palette size={18} strokeWidth={2.2} />
            </button>
          </Tooltip>
        </Popover>

        <Popover
          content={<BgContent currentBg={currentBg} setCurrentBg={setCurrentBg} isDarkMode={isDarkMode} />}
          trigger="click"
          placement={collapsed ? "right" : "top"}
          arrow={false}
          overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
        >
          <Tooltip title="Фон страницы" placement={collapsed ? "right" : "top"}>
            <button
              aria-label="Фон страницы"
              className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <Layers size={18} strokeWidth={2.2} />
            </button>
          </Tooltip>
        </Popover>

        <Popover
          content={
            <LayoutContent
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              moveHeader={moveHeader}
              setMoveHeader={setMoveHeader}
              layoutModes={layoutModes}
            />
          }
          trigger="click"
          placement={collapsed ? "right" : "top"}
          arrow={false}
          overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0, backgroundColor: "transparent" }}
        >
          <Tooltip title="Макет страницы" placement={collapsed ? "right" : "top"}>
            <button
              aria-label="Макет страницы"
              className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
            >
              <If is={layoutMode === "top"}>
                <PanelTop size={18} strokeWidth={2.2} />
              </If>
              <If is={layoutMode === "left"}>
                <PanelLeft size={18} strokeWidth={2.2} />
              </If>
              <If is={layoutMode === "bottom"}>
                <PanelBottom size={18} strokeWidth={2.2} />
              </If>
              <If is={layoutMode === "right"}>
                <PanelRight size={18} strokeWidth={2.2} />
              </If>
            </button>
          </Tooltip>
        </Popover>

        <Tooltip title="Выйти" placement={collapsed ? "right" : "top"}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Выход"
            className="flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={16} strokeWidth={2.2} />
          </button>
        </Tooltip>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <AnimatePresence>
        <If is={isDesktopActive}>
          <DesktopMode
            userData={userData}
            onClose={() => setIsDesktopActive(false)}
            isDark={isDarkMode}
          />
        </If>
      </AnimatePresence>
    </>
  );
};
