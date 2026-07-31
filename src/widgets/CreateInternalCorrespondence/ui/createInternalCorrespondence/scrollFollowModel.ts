import type { RefObject } from "react";

import type { PageOrientation } from "../../types";

// Рефы, общие для всех «пришвартованных» блоков: вертикальный скроллер
// страницы, холст-опора (его верх — точка отсчёта) и липкая шапка редактора,
// под которую прижимается всё остальное.
export interface IScrollFollowRefs {
  rootScrollRef: RefObject<HTMLDivElement | null>;
  pageCanvasRef: RefObject<HTMLDivElement | null>;
  stickyHeaderRef: RefObject<HTMLDivElement | null>;
}

// Изменения, после которых нужно пересчитать позицию: геометрия страницы или
// высота липкой шапки.
export interface IScrollFollowLayout {
  pageCount: number;
  orientation: PageOrientation;
  formExpanded: boolean;
  panelsInToolbar: boolean;
}
