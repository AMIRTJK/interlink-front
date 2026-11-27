import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";

// Сколько миллисекунд без движения курсора кнопки остаются видимыми перед плавным скрытием.
const IDLE_HIDE_MS = 3_000;
// Минимальный сдвиг указателя в пикселях, чтобы случайный шум не будил скрытые кнопки.
const MOVE_THRESHOLD_PX = 2;

/**
 * Отслеживает активность указателя на экране блокировки: в покое кнопки управления
 * (переключатель тем, выход) плавно скрываются, при движении курсора или касании —
 * сразу появляются. При навигации с клавиатуры (:focus-visible) скрытие ставится на паузу.
 */
export const usePointerActivity = () => {
  const [isActive, setIsActive] = useState(true);
  const [isFocusPinned, setIsFocusPinned] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setIsActive(false);
    }, IDLE_HIDE_MS);
  }, [clearTimer]);

  const wake = useCallback(() => {
    setIsActive(true);
    if (!isFocusPinned) scheduleHide();
  }, [isFocusPinned, scheduleHide]);

  useEffect(() => {
    if (isFocusPinned) {
      clearTimer();
      setIsActive(true);
      return;
    }

    scheduleHide();
    return clearTimer;
  }, [isFocusPinned, clearTimer, scheduleHide]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const prev = lastPointRef.current;
      const next = { x: event.clientX, y: event.clientY };
      lastPointRef.current = next;
      if (
        prev &&
        Math.abs(next.x - prev.x) < MOVE_THRESHOLD_PX &&
        Math.abs(next.y - prev.y) < MOVE_THRESHOLD_PX
      ) {
        return;
      }
      wake();
    };

    const handlePointerDown = () => wake();
    const handleWheel = () => wake();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [wake]);

  // Клики мышью ставят :focus, но не :focus-visible — проверяем именно клавиатурный фокус,
  // чтобы панель не зависала видимой после выбора темы кликом.
  const handleControlFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
      setIsFocusPinned(true);
    }
  }, []);

  const handleControlBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusPinned(false);
    }
  }, []);

  return {
    isControlsVisible: isActive || isFocusPinned,
    handleControlFocus,
    handleControlBlur,
  };
};
