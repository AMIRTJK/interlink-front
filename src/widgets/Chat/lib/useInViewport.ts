import { useEffect, useRef, useState } from "react";

/** Запас до края экрана: карточка успевает подгрузиться к моменту показа. */
const ROOT_MARGIN = "300px";

/**
 * Признак того, что элемент доехал до экрана. Срабатывает один раз: дальше
 * следить не за чем, а лишний наблюдатель на каждом сообщении переписки стоит
 * дороже, чем разовое включение.
 */
export const useInViewport = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsVisible(true);
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return { ref, isVisible };
};
