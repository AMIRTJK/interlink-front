import { useEffect, useState } from "react";
import { tokenControl } from "@shared/lib";

/**
 * Общие настройки оформления (тема, фон, тёмный режим) для всех раскладок.
 *
 * Держит их в одном месте, чтобы личный кабинет и модули применяли одинаковые
 * тему и фон, а элементы управления оформлением были доступны везде.
 */
export const useDesignSettings = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentTheme") || "emerald";
    }
    return "emerald";
  });

  const [currentBg, setCurrentBg] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentBg") || "arctic";
    }
    return "arctic";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return tokenControl.getDarkMode();
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Синхронизация темы/фона между раскладками при переключении модулей.
  useEffect(() => {
    const sync = () => {
      setCurrentTheme(localStorage.getItem("currentTheme") || "emerald");
      setCurrentBg(localStorage.getItem("currentBg") || "arctic");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return { currentTheme, setCurrentTheme, currentBg, setCurrentBg, isDarkMode };
};
