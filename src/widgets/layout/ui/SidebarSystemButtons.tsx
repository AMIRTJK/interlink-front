import { useState } from "react";
import { Popover, Tooltip } from "antd";
import {
  Bell,
  Lock,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { tokenControl, useLogout } from "@shared/lib";
import { NotificationsPopover, useNotificationCounters } from "@features/notifications";
import { useChat } from "@widgets/Chat";
import { If } from "@shared/ui";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { useSessionLock } from "@features/Profile/ui/DesktopMode";
import { useLayoutMode } from "./useLayoutMode";
import { useDesignSettings } from "./useDesignSettings";
import { HeaderButtonGroup } from "./header/HeaderButtonGroup";
import { HeaderDesignGroup } from "./header/HeaderDesignGroup";
import { HEADER_GROUP_LABELS } from "./header/headerModel";

interface IProps {
  collapsed: boolean;
}

export const SidebarSystemButtons = ({ collapsed }: IProps) => {
  const { currentTheme, setCurrentTheme, currentBg, setCurrentBg } = useDesignSettings();
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => tokenControl.getDarkMode());
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { lock } = useSessionLock();
  const [notifOpen, setNotifOpen] = useState(false);
  const { counters } = useNotificationCounters();
  const unreadCount = counters.unread;
  const tooltipPlacement = collapsed ? "right" : "top";

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

  return (
    <>
      <div className={`flex ${collapsed ? "flex-col items-center gap-2" : "flex-wrap items-center justify-center gap-1.5"} px-1 mb-2`}>
        <HeaderButtonGroup label={HEADER_GROUP_LABELS.communications} isVertical={collapsed}>
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
        </HeaderButtonGroup>

        <HeaderDesignGroup
          label={HEADER_GROUP_LABELS.design}
          variant="compact"
          tooltipPlacement={tooltipPlacement}
          popoverPlacement={tooltipPlacement}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          currentBg={currentBg}
          setCurrentBg={setCurrentBg}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
        />

        <HeaderButtonGroup label={HEADER_GROUP_LABELS.session} isVertical={collapsed}>
        <Tooltip title="Блокирование" placement={collapsed ? "right" : "top"}>
          <button
            onClick={lock}
            aria-label="Блокирование"
            className="relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <Lock size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>
        <Tooltip title="Выйти" placement={collapsed ? "right" : "top"}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Выход"
            className="flex items-center justify-center w-10 h-10 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={16} strokeWidth={2.2} />
          </button>
        </Tooltip>
        </HeaderButtonGroup>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};
