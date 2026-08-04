import { useLayoutEffect, useState, RefObject } from "react";

interface IUseAutoPositionDrawerProps {
  isOpen: boolean;
  drawerRef: RefObject<HTMLDivElement | null>;
  padding?: number;
}

export function useAutoPositionDrawer({
  isOpen,
  drawerRef,
  padding = 16,
}: IUseAutoPositionDrawerProps) {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!isOpen || !drawerRef.current) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const updatePosition = () => {
      const el = drawerRef.current;
      if (!el) return;

      const prevTransform = el.style.transform;
      el.style.transform = "none";

      const rect = el.getBoundingClientRect();
      el.style.transform = prevTransform;

      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;

      let minTop = padding;
      const stickyHeader = document.querySelector<HTMLElement>("[data-sticky-editor-header]");
      if (stickyHeader) {
        const headerRect = stickyHeader.getBoundingClientRect();
        if (headerRect.bottom > 0 && headerRect.bottom < vh) {
          minTop = Math.max(minTop, headerRect.bottom + 12);
        }
      }

      let shiftX = 0;
      let shiftY = 0;

      if (rect.left < padding) {
        shiftX = padding - rect.left;
        if (rect.right + shiftX > vw - padding) {
          shiftX = Math.min(shiftX, vw - padding - rect.right);
        }
      } else if (rect.right > vw - padding) {
        shiftX = (vw - padding) - rect.right;
        if (rect.left + shiftX < padding) {
          shiftX = Math.max(shiftX, padding - rect.left);
        }
      }

      if (rect.top < minTop) {
        shiftY = minTop - rect.top;
      } else if (rect.bottom > vh - padding) {
        shiftY = (vh - padding) - rect.bottom;
        if (rect.top + shiftY < minTop) {
          shiftY = minTop - rect.top;
        }
      }

      setOffset({ x: Math.round(shiftX), y: Math.round(shiftY) });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const ro = new ResizeObserver(updatePosition);
    if (drawerRef.current) {
      ro.observe(drawerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      ro.disconnect();
    };
  }, [isOpen, drawerRef, padding]);

  return offset;
}
