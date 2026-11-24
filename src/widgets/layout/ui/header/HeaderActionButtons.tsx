import { Popover } from "antd";
import { Bell } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { NotificationsPopover } from "@features/notifications";
import type { LayoutMode } from "../designSettings";
import { HeaderAppearanceMenu } from "./HeaderAppearanceMenu";
import { HeaderPageMenu } from "./HeaderPageMenu";
import { HeaderSessionMenu } from "./HeaderSessionMenu";
import { HEADER_ICON_BUTTON_CLASS, HEADER_POPOVER_INNER_STYLE } from "./headerModel";

interface IHeaderActionButtonsProps {
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  unreadCount: number;
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

// Уведомления остаются отдельной кнопкой: счётчик непрочитанных должен быть на
// виду, а поповер со списком у неё и так свой.
export const HeaderActionButtons = ({
  notifOpen,
  setNotifOpen,
  unreadCount,
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
}: IHeaderActionButtonsProps) => (
  <div className="flex items-center gap-2 shrink-0">
    <HeaderAppearanceMenu
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      currentTheme={currentTheme}
      setCurrentTheme={setCurrentTheme}
    />

    <HeaderPageMenu
      isDarkMode={isDarkMode}
      currentBg={currentBg}
      setCurrentBg={setCurrentBg}
      layoutMode={layoutMode}
      setLayoutMode={setLayoutMode}
    />

    <Popover
      content={<NotificationsPopover open={notifOpen} />}
      open={notifOpen}
      onOpenChange={setNotifOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={HEADER_POPOVER_INNER_STYLE}
    >
      <Tooltip title="Уведомления" placement="bottom">
        <button type="button" aria-label="Уведомления" className={HEADER_ICON_BUTTON_CLASS}>
          <Bell size={18} strokeWidth={2.2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>
    </Popover>

    <HeaderSessionMenu
      onLock={() => setIsDesktopActive(true)}
      onLogout={() => setShowLogoutConfirm(true)}
    />
  </div>
);
