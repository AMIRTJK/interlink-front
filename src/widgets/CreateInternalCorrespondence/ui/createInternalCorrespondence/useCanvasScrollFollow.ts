import { useEffect, type RefObject } from "react";

import type {
  IScrollFollowLayout,
  IScrollFollowRefs,
} from "./scrollFollowModel";

interface ISideCanvasParams extends IScrollFollowRefs {
  showOriginalLetterSides: boolean;
  showVersionCompareSides: boolean;
  originalCanvasWrapRef: RefObject<HTMLDivElement | null>;
  versionCompareCanvasWrapRef: RefObject<HTMLDivElement | null>;
  composeMode?: "reply" | "forward";
  sourceLetter?: unknown;
}

// Общий скролл-follow для активного бокового холста: либо сравнение версий,
// либо просмотр входящего письма.
export const useSideCanvasScrollFollow = ({
  showOriginalLetterSides,
  showVersionCompareSides,
  originalCanvasWrapRef,
  versionCompareCanvasWrapRef,
  rootScrollRef,
  pageCanvasRef,
  stickyHeaderRef,
  composeMode,
  sourceLetter,
}: ISideCanvasParams) => {
  useEffect(() => {
    const activeWrap = showVersionCompareSides
      ? versionCompareCanvasWrapRef.current
      : showOriginalLetterSides
      ? originalCanvasWrapRef.current
      : null;
    if (!activeWrap) return;
    const scroller = rootScrollRef.current;
    const canvas = pageCanvasRef.current;
    if (!scroller || !canvas) return;

    const BOT_M = 24;
    let shift = 0;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 40) + 12;
      const viewH = scroller.clientHeight;
      const wrapH = activeWrap.offsetHeight;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      const maxShift = Math.max(canvas.offsetHeight - wrapH, 0);

      if (wrapH <= viewH - TOP_M - BOT_M) {
        shift = TOP_M - canvasTop;
      } else {
        const pinTop = TOP_M - canvasTop;
        const pinBottom = viewH - BOT_M - wrapH - canvasTop;
        shift = Math.min(Math.max(shift, pinBottom), pinTop);
      }
      shift = Math.min(Math.max(shift, 0), maxShift);
      activeWrap.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [showOriginalLetterSides, showVersionCompareSides, composeMode, sourceLetter]);
};

interface IOriginalCanvasParams extends IScrollFollowRefs, IScrollFollowLayout {
  showOriginalLetterSides: boolean;
  originalCanvasWrapRef: RefObject<HTMLDivElement | null>;
  composeMode?: "reply" | "forward";
  sourceLetter?: unknown;
}

export const useOriginalCanvasScrollFollow = ({
  showOriginalLetterSides,
  originalCanvasWrapRef,
  rootScrollRef,
  pageCanvasRef,
  stickyHeaderRef,
  composeMode,
  sourceLetter,
  pageCount,
  orientation,
  formExpanded,
  panelsInToolbar,
}: IOriginalCanvasParams) => {
  // Sticky-позиционирование левого A4-холста входящего письма: при прокрутке
  // страницы холст остаётся на виду рядом с редактируемым исходящим письмом.
  // CSS position:sticky здесь не работает — между холстом и вертикальным
  // скролл-контейнером страницы стоит серая область с overflow-auto
  // (горизонтальная прокрутка), которая перехватывает sticky. Поэтому смещаем
  // холст вручную по scroll/resize через transform. Опорная точка — правый
  // холст (pageCanvasRef): оба лежат в одном flex-ряду с items-start, их
  // верхние края совпадают, а сам он не трансформируется.
  useEffect(() => {
    if (!showOriginalLetterSides || !composeMode || !sourceLetter) return;
    const scroller = rootScrollRef.current;
    const wrap = originalCanvasWrapRef.current;
    const canvas = pageCanvasRef.current;
    if (!scroller || !wrap || !canvas) return;

    // Лист прилипает ПОД липкой шапкой редактора (тулбар + панель разделов +
    // пагинация). Её высота динамическая, поэтому берём её в рантайме. Сам лист
    // за счёт maxHeight (в OriginalLetterCanvas) помещается в окно целиком — его
    // содержимое при нехватке высоты прокручивается внутри.
    const BOT_M = 24;
    let shift = 0;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 40) + 12;
      const viewH = scroller.clientHeight;
      const wrapH = wrap.offsetHeight;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      const maxShift = Math.max(canvas.offsetHeight - wrapH, 0);

      if (wrapH <= viewH - TOP_M - BOT_M) {
        // Холст помещается в окно целиком — прилипает под панелью пагинации.
        shift = TOP_M - canvasTop;
      } else {
        // Страховка на случай расхождения измерений на пару пикселей:
        // двусторонний sticky (вниз — прилипает нижним краем, вверх — верхним).
        const pinTop = TOP_M - canvasTop;
        const pinBottom = viewH - BOT_M - wrapH - canvasTop;
        shift = Math.min(Math.max(shift, pinBottom), pinTop);
      }
      shift = Math.min(Math.max(shift, 0), maxShift);
      wrap.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      wrap.style.transform = "";
    };
  }, [
    showOriginalLetterSides,
    composeMode,
    sourceLetter,
    pageCount,
    orientation,
    formExpanded,
    panelsInToolbar,
  ]);
};
