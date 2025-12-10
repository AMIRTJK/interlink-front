import { useCallback, useRef } from "react";

/**
 * Хук для создания debounce-колбэка
 * @param callback - Функция, которая должна быть вызвана с задержкой
 * @param delay - Задержка в миллисекундах
 * @returns Debounced callback
 */
export const useDebouncedCallback = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};
