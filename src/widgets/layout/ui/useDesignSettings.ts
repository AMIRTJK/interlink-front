import { useCallback, useEffect, useState } from "react";
import { tokenControl } from "@shared/lib";
import {
  BG_STORAGE_KEY,
  DESIGN_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  readThemeKey,
} from "@shared/config";

const THEME_KEY = THEME_STORAGE_KEY;
const BG_KEY = BG_STORAGE_KEY;
const CHANGE_EVENT = DESIGN_CHANGE_EVENT;

const readTheme = readThemeKey;

const readBg = (): string => {
  if (typeof window === "undefined") return "arctic";
  return localStorage.getItem(BG_KEY) || "arctic";
};

/**
 * Общие настройки оформления (тема, фон, тёмный режим) для всех раскладок.
 *
 * Держит их в одном месте, чтобы личный кабинет и модули применяли одинаковые
 * тему и фон, а элементы управления оформлением были доступны везде.
 */
export const useDesignSettings = () => {
  const [currentTheme, setCurrentThemeState] = useState<string>(readTheme);
  const [currentBg, setCurrentBgState] = useState<string>(readBg);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return tokenControl.getDarkMode();
    }
    return false;
  });

  const setCurrentTheme = useCallback((theme: string) => {
    localStorage.setItem(THEME_KEY, theme);
    setCurrentThemeState(theme);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: theme }));
    } catch {
      // Игнорируем ошибку конструирования события в старых средах
    }
  }, []);

  const setCurrentBg = useCallback((bg: string) => {
    localStorage.setItem(BG_KEY, bg);
    setCurrentBgState(bg);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: BG_KEY, newValue: bg }));
    } catch {
      // Игнорируем ошибку конструирования события в старых средах
    }
  }, []);

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

  // Синхронизация темы/фона между всеми поддеревьями и элементами управления.
  useEffect(() => {
    const sync = () => {
      setCurrentThemeState(readTheme());
      setCurrentBgState(readBg());
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { currentTheme, setCurrentTheme, currentBg, setCurrentBg, isDarkMode };
};

