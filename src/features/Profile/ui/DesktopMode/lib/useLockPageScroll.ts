import { useEffect } from "react";

/**
 * Пока экран блокировки открыт, страница под ним не прокручивается: сам экран
 * fixed и без прокрутки, но длинная страница за ним иначе показывает свою полосу
 * прокрутки справа и прокручивается колесом. Прежнее значение возвращаем как
 * было, чтобы не затереть чужую блокировку прокрутки (например, открытой модалки).
 */
export const useLockPageScroll = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [isActive]);
};
