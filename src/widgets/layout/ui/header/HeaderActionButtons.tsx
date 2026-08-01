import { Popover } from "antd";
import {
  Bell,
  LogOut,
  Sun,
  Moon,
  Palette,
  Layers,
  MessageSquare,
  PanelTop,
  PanelLeft,
  PanelBottom,
  PanelRight,
  Monitor,
} from "lucide-react";
import { Tooltip } from "@shared/ui";
import { NotificationsPopover } from "@features/notifications";
import type { LayoutMode } from "../designSettings";
import { HeaderThemePopover } from "./HeaderThemePopover";
import { HeaderBgPopover } from "./HeaderBgPopover";
import { HeaderLayoutPopover } from "./HeaderLayoutPopover";

interface IHeaderActionButtonsProps {
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  unreadCount: number;
  openChat: () => void;
  setIsDesktopActive: (active: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
  setShowLogoutConfirm: (show: boolean) => void;
}

export const HeaderActionButtons = ({
  notifOpen,
  setNotifOpen,
  unreadCount,
  openChat,
  setIsDesktopActive,
  isDarkMode,
  toggleTheme,
  currentTheme,
  setCurrentTheme,
  currentBg,
  setCurrentBg,
  layoutMode,
  setLayoutMode,
  setShowLogoutConfirm,
}: IHeaderActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <Popover
          content={<NotificationsPopover open={notifOpen} />}
          open={notifOpen}
          onOpenChange={setNotifOpen}
          trigger="click"
          placement="bottomRight"
          arrow={false}
          overlayInnerStyle={{
            borderRadius: "2.5rem",
            padding: 0,
            backgroundColor: "transparent",
          }}
        >
          <Tooltip title="Уведомления" placement="bottom">
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
          </Tooltip>
        </Popover>

        <Tooltip title="Чат" placement="bottom">
          <button
            onClick={openChat}
            aria-label="Открыть чат"
            className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <MessageSquare size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>

        <Tooltip title="Рабочий стол" placement="bottom">
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
          placement="bottom"
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
        className="w-px! h-6! bg-white/30 dark:bg-zinc-700/40 mx-1"
        aria-hidden="true"
      />

      <Popover
        content={
          <HeaderThemePopover
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
          />
        }
        trigger="click"
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{
          borderRadius: "2.5rem",
          padding: 0,
          backgroundColor: "transparent",
        }}
      >
        <Tooltip title="Выберите тему" placement="bottom">
          <button
            aria-label="Выбор темы"
            className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <Palette size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>
      </Popover>

      <Popover
        content={
          <HeaderBgPopover
            currentBg={currentBg}
            setCurrentBg={setCurrentBg}
            isDarkMode={isDarkMode}
          />
        }
        trigger="click"
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{
          borderRadius: "2.5rem",
          padding: 0,
          backgroundColor: "transparent",
        }}
      >
        <Tooltip title="Фон страницы" placement="bottom">
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
          <HeaderLayoutPopover
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />
        }
        trigger="click"
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{
          borderRadius: "2.5rem",
          padding: 0,
          backgroundColor: "transparent",
        }}
      >
        <Tooltip title="Макет страницы" placement="bottom">
          <button
            aria-label="Макет страницы"
            className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            {layoutMode === "top" && <PanelTop size={18} strokeWidth={2.2} />}
            {layoutMode === "left" && <PanelLeft size={18} strokeWidth={2.2} />}
            {layoutMode === "bottom" && <PanelBottom size={18} strokeWidth={2.2} />}
            {layoutMode === "right" && <PanelRight size={18} strokeWidth={2.2} />}
          </button>
        </Tooltip>
      </Popover>

      <Tooltip title="Выйти" placement="bottomRight">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          aria-label="Выход"
          className="flex items-center gap-2 py-2 px-4 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span className="hidden sm:inline">Выход</span>
        </button>
      </Tooltip>
    </div>
  );
};
