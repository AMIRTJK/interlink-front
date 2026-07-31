import React, { useRef, type Dispatch, type RefObject, type SetStateAction } from "react";

import { dsStampHeightForWidth } from "../../lib/utils";
import { GRID_SNAP_STEP, snapToGrid } from "./PageGrid";
import {
  DS_STAMP_DEFAULT_HEIGHT,
  DS_STAMP_DEFAULT_WIDTH,
  DS_STAMP_MAX_WIDTH,
  DS_STAMP_MIN_WIDTH,
} from "./stampGeometry";

interface IStampSize {
  width: number;
  height: number;
}

interface IParams {
  editorRef: RefObject<HTMLDivElement | null>;
  isDsApplied?: boolean;
  gridEnabled: boolean;
  pageCount: number;
  pageStride: number;
  pageGap: number;
  pagePadV: number;
  stampPos: { x: number; y: number };
  setStampPos: Dispatch<SetStateAction<{ x: number; y: number }>>;
  stampSize: IStampSize;
  setStampSize: Dispatch<SetStateAction<IStampSize>>;
}

export const useStampDrag = ({
  editorRef,
  isDsApplied,
  gridEnabled,
  pageCount,
  pageStride,
  pageGap,
  pagePadV,
  stampPos,
  setStampPos,
  stampSize,
  setStampSize,
}: IParams) => {
  const isDraggingStamp = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleStampMouseDown = (e: React.MouseEvent) => {
    if (isDsApplied) return;

    e.preventDefault();
    e.stopPropagation();
    isDraggingStamp.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingStamp.current || !editorRef.current) return;

      const cr = editorRef.current.getBoundingClientRect();

      // Вычисляем максимальную доступную высоту на основе сгенерированных страниц,
      // а не высоты контента внутри editorRef.
      // Вычитаем pagePadV * 2, чтобы штамп оставался строго в границах печатной области.
      const maxCanvasHeight =
        pageCount * pageStride - pageGap - pagePadV * 2;
      const currentStampWidth =
        typeof stampSize.width === "number"
          ? stampSize.width
          : DS_STAMP_DEFAULT_WIDTH;
      const currentStampHeight =
        typeof stampSize.height === "number"
          ? stampSize.height
          : DS_STAMP_DEFAULT_HEIGHT;

      let nextX = ev.clientX - cr.left - dragOffset.current.x;
      let nextY = ev.clientY - cr.top - dragOffset.current.y;

      // Привязка к сетке работает, пока сетка показана (в Word — «привязать
      // объекты к сетке, когда она отображается»), и снимается зажатым Alt.
      if (gridEnabled && !ev.altKey) {
        nextX = snapToGrid(nextX, GRID_SNAP_STEP);
        // Сетка отсчитывается от полей КАЖДОЙ страницы, поэтому по вертикали
        // магнитим внутри страницы, а не по сквозной координате холста —
        // иначе на второй и дальше странице привязка ушла бы мимо линий.
        const page = Math.max(0, Math.floor(nextY / pageStride));
        nextY =
          page * pageStride +
          snapToGrid(nextY - page * pageStride, GRID_SNAP_STEP);
      }

      // Границы печатной области важнее привязки: у края объект встаёт вплотную.
      setStampPos({
        x: Math.max(0, Math.min(nextX, cr.width - currentStampWidth)),
        y: Math.max(0, Math.min(nextY, maxCanvasHeight - currentStampHeight)),
      });
    };

    const onMouseUp = () => {
      isDraggingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Масштабирование штампа ЭЦП за угловой маркер (только на этапе размещения, до
  // подписания). Пропорции макета фиксированы (SVG preserveAspectRatio), поэтому
  // тянем ТОЛЬКО ширину, а высоту выводим из неё через dsStampHeightForWidth —
  // так экранный, вшитый и печатный штампы остаются идентичными. Выбранный размер
  // хранится в stampSize и уже проброшен во все режимы (плейсхолдер, вшитая
  // картинка при подписании, предпросмотр и печать через getPreviewStamp).
  const handleStampResizeMouseDown = (e: React.MouseEvent) => {
    if (isDsApplied) return;
    // stopPropagation — чтобы захват маркера не запускал перетаскивание штампа.
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth =
      typeof stampSize.width === "number"
        ? stampSize.width
        : DS_STAMP_DEFAULT_WIDTH;

    const onMouseMove = (ev: MouseEvent) => {
      // Верхняя граница: не даём штампу вылезти за правый край печатной области.
      const cr = editorRef.current?.getBoundingClientRect();
      const maxByCanvas = cr ? cr.width - stampPos.x : DS_STAMP_MAX_WIDTH;
      const upperBound = Math.min(DS_STAMP_MAX_WIDTH, Math.max(
        DS_STAMP_MIN_WIDTH,
        maxByCanvas,
      ));
      const nextWidth = Math.round(
        Math.max(
          DS_STAMP_MIN_WIDTH,
          Math.min(startWidth + (ev.clientX - startX), upperBound),
        ),
      );
      setStampSize({
        width: nextWidth,
        height: dsStampHeightForWidth(nextWidth),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return { handleStampMouseDown, handleStampResizeMouseDown };
};
