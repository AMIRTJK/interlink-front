import type { PageOrientation } from "../../types";

// CSS-пикселей в сантиметре при 96 dpi (A4 794px = 21см). Константа физическая,
// от ориентации не зависит.
export const PX_PER_CM = 96 / 2.54;

// Горизонтальная линейка над листом: сантиметровые деления с подписями, поля
// страницы затенены, границы полей — синие. Ширину и поля берём из геометрии
// листа, поэтому линейка точно совпадает с колонкой набора. Sticky — остаётся
// вверху вьюпорта при вертикальной прокрутке (как в Word).
export const RULER_MIN_MARGIN = 16; // минимальное поле, px
export const RULER_MIN_CONTENT = 160; // минимальная ширина колонки набора, px
export const RULER_DEFAULT_MARGIN = 80; // поле «по умолчанию» — к нему возвращает сброс

// ===== Раскладка листа в теле версии =====
// Отдельного поля под настройки линейки у версии на бэкенде нет, а тело письма
// (`body`) версионируется целиком. Поэтому раскладку кладём скрытым маркером в
// начало сохраняемого HTML и снимаем его сразу при загрузке: в DOM редактора,
// истории правок и пагинации маркер никогда не участвует.
export const DOC_LAYOUT_ATTR = "data-doc-layout";

export type DocLayout = {
  marginLeft: number;
  marginRight: number;
  orientation: PageOrientation;
};

export const DEFAULT_DOC_LAYOUT: DocLayout = {
  marginLeft: RULER_DEFAULT_MARGIN,
  marginRight: RULER_DEFAULT_MARGIN,
  orientation: "portrait",
};

export const pageWidthForOrientation = (orientation: PageOrientation) =>
  orientation === "landscape" ? 1122 : 794;

// Значения из чужой/устаревшей версии зажимаем теми же границами, что и
// перетаскивание маркеров, — колонка набора не должна «схлопнуться».
export const normalizeDocLayout = (raw: unknown): DocLayout | null => {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const orientation: PageOrientation =
    src.orientation === "landscape" ? "landscape" : "portrait";
  const cap = Math.round(
    (pageWidthForOrientation(orientation) - RULER_MIN_CONTENT) / 2,
  );
  const margin = (value: unknown, fallback: number) => {
    // null/undefined/"" — поля в маркере нет: это «не задано», а не ноль,
    // иначе Number(null) === 0 зажался бы в минимальное поле вместо дефолта.
    if (value === null || value === undefined || value === "") return fallback;
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.round(Math.min(Math.max(n, RULER_MIN_MARGIN), cap));
  };
  return {
    orientation,
    marginLeft: margin(src.marginLeft, DEFAULT_DOC_LAYOUT.marginLeft),
    marginRight: margin(src.marginRight, DEFAULT_DOC_LAYOUT.marginRight),
  };
};

// Сброс относится именно к линейке, поэтому сравниваем только поля: ориентация
// переключается отдельной кнопкой тулбара и её выбор сбросом не трогаем.
export const hasDefaultRulerMargins = (layout: DocLayout): boolean =>
  layout.marginLeft === DEFAULT_DOC_LAYOUT.marginLeft &&
  layout.marginRight === DEFAULT_DOC_LAYOUT.marginRight;

export const parseDocLayoutAttr = (value: string | null): DocLayout | null => {
  if (!value) return null;
  try {
    return normalizeDocLayout(JSON.parse(decodeURIComponent(value)));
  } catch {
    return null;
  }
};

// Маркер пишем в начало тела: hidden + display:none, поэтому ни на холсте, ни в
// предпросмотре/печати он ничего не занимает. JSON кодируем percent-escape —
// иначе кавычки внутри атрибута порвут разметку.
export const withDocLayout = (html: string, layout: DocLayout): string =>
  `<div ${DOC_LAYOUT_ATTR}="${encodeURIComponent(
    JSON.stringify(layout),
  )}" hidden aria-hidden="true" style="display:none"></div>${html}`;

export const splitDocLayout = (
  html: string | null | undefined,
): { layout: DocLayout | null; body: string } => {
  const src = html || "";
  if (!src.includes(DOC_LAYOUT_ATTR)) return { layout: null, body: src };
  const holder = document.createElement("div");
  holder.innerHTML = src;
  const nodes = Array.from(holder.querySelectorAll(`[${DOC_LAYOUT_ATTR}]`));
  let layout: DocLayout | null = null;
  for (const node of nodes) {
    if (!layout) layout = parseDocLayoutAttr(node.getAttribute(DOC_LAYOUT_ATTR));
    node.remove();
  }
  return { layout, body: holder.innerHTML };
};

export const stripDocLayout = (html: string | null | undefined): string =>
  splitDocLayout(html).body;
