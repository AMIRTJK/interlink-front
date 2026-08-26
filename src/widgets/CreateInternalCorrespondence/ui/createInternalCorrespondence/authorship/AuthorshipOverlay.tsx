import { useEffect, useRef, useState, type RefObject } from "react";

import { cn } from "@shared/lib";

import {
  EDITOR_SURFACE_CLASS,
  editorSurfaceStyle,
} from "../editorSurfaceStyle";

import { AuthorshipPopover } from "./AuthorshipPopover";
import { AUTHORSHIP_ATTR } from "./model";
import type { IAuthorshipFragment } from "./markAuthorship";

interface IHoverState {
  fragment: IAuthorshipFragment;
  x: number;
  y: number;
}

interface IProps {
  /** Разметка версии, лежащей в редакторе, со вставленными <mark> авторов */
  html: string;
  fragments: IAuthorshipFragment[];
  /** Холст страницы: на нём ловим наведение, сам слой событий не получает */
  hostRef: RefObject<HTMLElement | null>;
  marginLeft: number;
  marginRight: number;
  pagePadV: number;
  contentHeight: number;
}

/**
 * Подсветка авторов поверх основного холста.
 *
 * Красить сам редактор нельзя: его innerHTML — это тело документа, и <mark>
 * уехали бы в сохранённую версию. Поэтому кладём под редактируемый текст
 * невидимую копию той же разметки: типографика у слоёв общая
 * (EDITOR_SURFACE_CLASS + editorSurfaceStyle), поэтому строки совпадают
 * символ в символ, а видно из копии только цветные подложки <mark>.
 *
 * Наведение ищем через elementsFromPoint: слой лежит ПОД редактором, обычным
 * ховером до него не достать, но в стопке элементов под курсором он есть.
 * Состояние ховера живёт здесь — оно меняется на каждое движение мыши.
 */
export const AuthorshipOverlay = ({
  html,
  fragments,
  hostRef,
  marginLeft,
  marginRight,
  pagePadV,
  contentHeight,
}: IProps) => {
  const [hover, setHover] = useState<IHoverState | null>(null);
  const fragmentsRef = useRef(fragments);
  fragmentsRef.current = fragments;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      if (frame) return;
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const mark = document
          .elementsFromPoint(clientX, clientY)
          .find((element) => element.hasAttribute(AUTHORSHIP_ATTR));

        if (!mark) {
          setHover((prev) => (prev ? null : prev));
          return;
        }

        const fragment =
          fragmentsRef.current[Number(mark.getAttribute(AUTHORSHIP_ATTR))];
        if (!fragment) return;

        const rect = mark.getBoundingClientRect();
        setHover({ fragment, x: rect.left + rect.width / 2, y: rect.top });
      });
    };

    const handleLeave = () => setHover(null);

    host.addEventListener("pointermove", handleMove);
    host.addEventListener("pointerleave", handleLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
      setHover(null);
    };
  }, [hostRef]);

  return (
    <>
      <div
        aria-hidden
        className={cn(
          EDITOR_SURFACE_CLASS,
          "pointer-events-none select-none [&_[data-authorship]]:pointer-events-auto",
        )}
        style={{
          ...editorSurfaceStyle(contentHeight),
          position: "absolute",
          top: pagePadV,
          left: marginLeft,
          right: marginRight,
          width: "auto",
          zIndex: 0,
          // Текст копии не нужен — под ним стоит настоящий, буква в букву.
          // Видимыми остаются только подложки <mark>.
          color: "transparent",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {hover && (
        <AuthorshipPopover fragment={hover.fragment} x={hover.x} y={hover.y} />
      )}
    </>
  );
};
