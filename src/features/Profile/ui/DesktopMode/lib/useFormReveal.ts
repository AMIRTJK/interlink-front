import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

const IDLE_CONCEAL_MS = 60_000;
const IDLE_CHECK_MS = 5_000;

const isActivationKey = (event: KeyboardEvent) => event.key === "Enter" || event.key === " ";

const isPrintableKey = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

// Enter и пробел на сфокусированной кнопке (переключатель сцен, выход) должны
// нажать её, а не открыть форму.
const isOnInteractiveElement = (event: KeyboardEvent) =>
  event.target instanceof HTMLElement && event.target !== document.body;

/**
 * Форма пароля по требованию: в покое скрыта, появляется по клику или клавише.
 * Первый набранный символ не теряется: форма монтируется синхронно (flushSync)
 * прямо в обработчике keydown, поле получает фокус через autoFocus, и браузер
 * вводит символ уже в него. Esc, кнопка «Скрыть», щелчок мимо карточки или минута
 * бездействия с пустым полем прячут форму.
 */
export const useFormReveal = (isEnabled: boolean) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const hasValueRef = useRef(false);
  const lastActivityRef = useRef(0);

  const reveal = useCallback(() => setIsRevealed(true), []);
  const conceal = useCallback(() => {
    hasValueRef.current = false;
    setIsRevealed(false);
  }, []);

  useEffect(() => {
    if (!isEnabled || isRevealed) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActivationKey(event)) {
        if (isOnInteractiveElement(event)) return;
        event.preventDefault();
        flushSync(reveal);
        return;
      }
      if (isPrintableKey(event)) flushSync(reveal);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, isRevealed, reveal]);

  useEffect(() => {
    if (!isEnabled || !isRevealed) return;
    lastActivityRef.current = Date.now();

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      markActivity();
      if (event.key === "Escape") conceal();
    };
    // После неудачной попытки поле очищается без события input, поэтому флаг
    // остаётся поднятым и форма с ошибкой сама не прячется.
    const handleInput = (event: Event) => {
      markActivity();
      if (event.target instanceof HTMLInputElement) hasValueRef.current = event.target.value !== "";
    };
    const idleTimer = window.setInterval(() => {
      const isIdle = Date.now() - lastActivityRef.current > IDLE_CONCEAL_MS;
      if (isIdle && !hasValueRef.current) conceal();
    }, IDLE_CHECK_MS);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", markActivity);
    window.addEventListener("pointermove", markActivity);
    window.addEventListener("input", handleInput);
    return () => {
      window.clearInterval(idleTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("pointermove", markActivity);
      window.removeEventListener("input", handleInput);
    };
  }, [isEnabled, isRevealed, conceal]);

  return { isRevealed: !isEnabled || isRevealed, reveal, conceal };
};
