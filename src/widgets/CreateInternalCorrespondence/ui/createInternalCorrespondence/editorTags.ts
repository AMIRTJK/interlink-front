import {
  PAGE_BREAK_ATTR,
  SPACER_ATTR,
  STAMP_ATTR,
} from "../../lib/constants";

// ===== Постраничная разбивка редактора =====
// Служебные атрибуты (SPACER_ATTR и соседи) вынесены в ../lib/constants —
// их читает ещё и область навигации.

export const EDITOR_BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "BLOCKQUOTE",
  "PRE",
  "FIGURE",
  "HR",
  "SECTION",
  "ARTICLE",
]);
export const EDITOR_ATOMIC_TAGS = new Set([
  "TABLE",
  "IMG",
  "FIGURE",
  "SVG",
  "VIDEO",
  "CANVAS",
]);
// Блоки, которые можно делить на «до/после курсора» при ручном разрыве страницы
export const PAGE_SPLITTABLE_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
]);

export const isSpacerNode = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(SPACER_ATTR);

export const isPageBreakNode = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(PAGE_BREAK_ATTR);

export const isStampNode = (n: Node | null): boolean =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(STAMP_ATTR);
