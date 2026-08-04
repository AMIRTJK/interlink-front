import { useLayoutEffect, useRef, RefObject } from "react";

interface IUseAutoPositionDrawerProps {
  isOpen: boolean;
  drawerRef: RefObject<HTMLDivElement | null>;
  padding?: number;
  // По горизонтали отступ от края экрана больше вертикального: панель шириной
  // 320px, упёршись в край окна, выглядит обрезанной.
  paddingX?: number;
}

/**
 * Удерживает раскрытую панель цилиндра в границах видимой области, не отрывая
 * её от своего цилиндра.
 *
 * Группа панелей едет за прокруткой собственным transform
 * (usePanelsGroupScrollFollow). Обработчик scroll на window в фазе перехвата
 * срабатывает РАНЬШЕ обработчика на самом скроллере, поэтому панель измерялась
 * до того, как группа сдвинется, — поправка всегда отставала на один кадр
 * прокрутки, и панель уезжала за левый край экрана. Пересчитываем в rAF-цикле:
 * он выполняется после всех обработчиков кадра и до отрисовки, так что панель
 * и группа всегда сдвигаются одним кадром.
 *
 * Смещение пишем прямо в style без CSS-перехода: анимированный transform
 * означал бы, что панель догоняет свой цилиндр 150 мс и всё это время может
 * находиться за краем экрана.
 */
export function useAutoPositionDrawer({
  isOpen,
  drawerRef,
  padding = 16,
  paddingX = 40,
}: IUseAutoPositionDrawerProps) {
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const drawer = drawerRef.current;
    if (!isOpen || !drawer) return;

    offsetRef.current = { x: 0, y: 0 };
    drawer.style.transform = "";

    let frame = 0;

    const updatePosition = () => {
      frame = requestAnimationFrame(updatePosition);

      const el = drawerRef.current;
      if (!el) return;

      // Измеряем с уже применённым смещением и вычитаем его — так обходимся
      // одним чтением геометрии за кадр, без сброса transform и второго reflow.
      const applied = offsetRef.current;
      const rect = el.getBoundingClientRect();
      const left = rect.left - applied.x;
      const right = rect.right - applied.x;
      const top = rect.top - applied.y;
      const bottom = rect.bottom - applied.y;

      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;

      let minTop = padding;
      const stickyHeader = document.querySelector<HTMLElement>(
        "[data-sticky-editor-header]",
      );
      if (stickyHeader) {
        const headerRect = stickyHeader.getBoundingClientRect();
        if (headerRect.bottom > 0 && headerRect.bottom < vh) {
          minTop = Math.max(minTop, headerRect.bottom + 12);
        }
      }

      let shiftX = 0;
      let shiftY = 0;

      if (left < paddingX) {
        shiftX = paddingX - left;
        if (right + shiftX > vw - paddingX) {
          shiftX = Math.min(shiftX, vw - paddingX - right);
        }
      } else if (right > vw - paddingX) {
        shiftX = vw - paddingX - right;
        if (left + shiftX < paddingX) {
          shiftX = Math.max(shiftX, paddingX - left);
        }
      }

      if (top < minTop) {
        shiftY = minTop - top;
      } else if (bottom > vh - padding) {
        shiftY = vh - padding - bottom;
        if (top + shiftY < minTop) {
          shiftY = minTop - top;
        }
      }

      const nextX = Math.round(shiftX);
      const nextY = Math.round(shiftY);
      if (nextX === applied.x && nextY === applied.y) return;

      offsetRef.current = { x: nextX, y: nextY };
      el.style.transform =
        nextX || nextY ? `translate3d(${nextX}px, ${nextY}px, 0)` : "";
    };

    updatePosition();

    return () => {
      cancelAnimationFrame(frame);
      offsetRef.current = { x: 0, y: 0 };
    };
  }, [isOpen, drawerRef, padding, paddingX]);
}
