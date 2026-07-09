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

const MOVE_HEADER_KEY = "moveHeaderToLayout";
const MOVE_HEADER_CHANGE_EVENT = "moveheaderchange";

export const useMoveHeader = (): [boolean, (val: boolean) => void] => {
  const [moveHeader, setMoveHeaderState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MOVE_HEADER_KEY) === "true";
  });

  const setMoveHeader = useCallback((val: boolean) => {
    localStorage.setItem(MOVE_HEADER_KEY, String(val));
    setMoveHeaderState(val);
    window.dispatchEvent(new Event(MOVE_HEADER_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    const sync = () => {
      setMoveHeaderState(localStorage.getItem(MOVE_HEADER_KEY) === "true");
    };
    window.addEventListener(MOVE_HEADER_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MOVE_HEADER_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [moveHeader, setMoveHeader];
};
