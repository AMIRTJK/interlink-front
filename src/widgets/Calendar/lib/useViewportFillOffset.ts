import { useLayoutEffect, useRef, useState } from "react";

/**
 * Расстояние от верха документа до элемента плюс резерв снизу — то, что нужно
 * вычесть из 100dvh, чтобы элемент заполнил остаток вьюпорта. Верх меряем, а не
 * зашиваем константой: высота шапок зависит от режима раскладки (шапка сверху
 * или боковая панель) и от переносов строк в заголовке.
 */
export const useViewportFillOffset = <T extends HTMLElement>(bottomReservePx: number) => {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const next = Math.ceil(top + bottomReservePx);
      setOffset((prev) => (prev === next ? prev : next));
    };

    measure();
    // Шапка, вкладки и заголовок над сеткой догружаются (lazy, аватар, шрифты) уже
    // после монтирования и сдвигают её вниз. Ближайший родитель при этом может не
    // меняться, а у html высота 100% и не меняется никогда, поэтому следим за всей
    // цепочкой предков: кто-то из них обязательно меняет размер. Петли нет — верх
    // сетки от её высоты не зависит.
    const observer = new ResizeObserver(measure);
    for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
      observer.observe(node);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [bottomReservePx]);

  return { ref, offset };
};
