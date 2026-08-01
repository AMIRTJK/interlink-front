import { useState, useEffect } from "react";
import { tokenControl, useLogout } from "@shared/lib";
import { useNotificationCounters } from "@features/notifications";
import { useChat } from "@widgets/Chat";
import { useProfileUser } from "../useProfileUser";

export const useHeaderState = () => {
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDesktopActive, setIsDesktopActive] = useState(false);
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

  const { userData, userName, userSubtitle } = useProfileUser();

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

  return {
    handleLogout,
    openChat,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isDesktopActive,
    setIsDesktopActive,
    notifOpen,
    setNotifOpen,
    unreadCount,
    isDarkMode,
    toggleTheme,
    userData,
    userName,
    userSubtitle,
  };
};
