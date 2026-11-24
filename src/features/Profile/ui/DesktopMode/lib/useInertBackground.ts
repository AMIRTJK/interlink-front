import { useEffect } from "react";
import { SESSION_LOCK_ROOT_ATTR } from "../lockModel";

/**
 * Пока экран блокировки открыт, всё прочее содержимое body получает `inert`:
 * перекрытия z-index мало — без этого Tab и экранные чтецы добирались бы до
 * интерфейса под блокировкой. Узлы, уже бывшие inert, не трогаем, чтобы не
 * снять чужой флаг при разблокировке.
 */
export const useInertBackground = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;
    const marked: Element[] = [];
    Array.from(document.body.children).forEach((element) => {
      if (element.hasAttribute(SESSION_LOCK_ROOT_ATTR) || element.hasAttribute("inert")) return;
      element.setAttribute("inert", "");
      marked.push(element);
    });
    return () => marked.forEach((element) => element.removeAttribute("inert"));
  }, [isActive]);
};
