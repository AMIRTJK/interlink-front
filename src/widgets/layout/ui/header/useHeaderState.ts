import { useState, useEffect, useCallback } from "react";
import { tokenControl, useLogout } from "@shared/lib";
import { useNotificationCounters } from "@features/notifications";
import { useSessionLock } from "@features/Profile/ui/DesktopMode";
import { useProfileUser } from "../useProfileUser";

export const useHeaderState = () => {
  const handleLogout = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { lock } = useSessionLock();
  // Экран блокировки монтирует SessionLockGate в MainLayout; здесь только
  // включение. Имя сохранено под контракт пропа HeaderActionButtons.
  const setIsDesktopActive = useCallback(
    (isActive: boolean) => {
      if (isActive) lock();
    },
    [lock],
  );
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
    showLogoutConfirm,
    setShowLogoutConfirm,
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
