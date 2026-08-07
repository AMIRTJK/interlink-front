import { useCallback, useLayoutEffect, useRef } from "react";

const FALLBACK_LINE_HEIGHT = 20;

/**
 * Растит `<textarea>` под содержимое до `maxRows` строк, дальше включает скролл.
 * Нативная textarea фиксированной высоты, а antd `Input.TextArea` сюда не подходит —
 * панель ввода чата написана на Tailwind без antd.
 */
export const useAutoResizeTextarea = (value: string, maxRows: number) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // Высоту сбрасываем до замера: иначе scrollHeight вернёт прошлый размер и поле не сожмётся.
    el.style.height = "auto";

    const styles = getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || FALLBACK_LINE_HEIGHT;
    const padding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const maxHeight = lineHeight * maxRows + padding;

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [maxRows]);

  useLayoutEffect(resize, [value, resize]);

  return ref;
};
