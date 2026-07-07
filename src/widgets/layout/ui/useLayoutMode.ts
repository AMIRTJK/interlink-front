import { useCallback, useEffect, useState } from "react";
import { LayoutMode } from "./designSettings";

const STORAGE_KEY = "layoutMode";
const CHANGE_EVENT = "layoutmodechange";

const isLayoutMode = (value: unknown): value is LayoutMode =>
  value === "top" || value === "left" || value === "bottom" || value === "right";

const readLayoutMode = (): LayoutMode => {
  if (typeof window === "undefined") return "top";
  const saved = localStorage.getItem(STORAGE_KEY);
  return isLayoutMode(saved) ? saved : "top";
};

/**
 * Единый макет страницы (top/left/bottom/right) для всей системы.
 *
 * Значение хранится в localStorage и синхронизируется между всеми раскладками
 * (личный кабинет и модули) через событие. Благодаря этому выбранный макет
 * автоматически применяется при переходе между модулями.
 */
export const useLayoutMode = (): [LayoutMode, (mode: LayoutMode) => void] => {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(readLayoutMode);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setLayoutModeState(mode);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    const sync = () => setLayoutModeState(readLayoutMode());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [layoutMode, setLayoutMode];
};
