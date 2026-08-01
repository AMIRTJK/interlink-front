import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebarCollapsed";
const CHANGE_EVENT = "sidebarcollapsedchange";

const readCollapsed = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

/**
 * Свёрнутое состояние боковой панели навигации.
 *
 * Хранится в localStorage и синхронизируется между компонентами через событие —
 * это нужно тем, кто позиционируется относительно панели (например, плавающая
 * кнопка чата), но не является её частью.
 */
export const useSidebarCollapsed = (): [boolean, (value: boolean) => void] => {
  const [collapsed, setCollapsedState] = useState<boolean>(readCollapsed);

  const setCollapsed = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setCollapsedState(value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    const sync = () => setCollapsedState(readCollapsed());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [collapsed, setCollapsed];
};

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_WIDTH_COLLAPSED = 64;
