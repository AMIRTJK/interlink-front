import { isPageBreakNode, isSpacerNode, isStampNode } from "../editorTags";
import {
  BASE_LINE_HEIGHT,
  CONTEXTUAL_SPACING_ATTR,
  DEFAULT_PARAGRAPH_FORMAT,
  PX_PER_CM,
  PX_PER_PT,
  type IParagraphFormat,
  type TParagraphAlign,
  type TParagraphLevel,
} from "./model";

// Блоки, к которым настройки абзаца неприменимы: линия и «атомарные» контейнеры
// (таблица/картинка/фигура) — у них своя геометрия, Word их тоже не форматирует
// как абзац.
const NON_PARAGRAPH_TAGS = new Set(["HR", "TABLE", "FIGURE", "IMG"]);
const LIST_TAGS = new Set(["UL", "OL"]);

type TAlignCss = "left" | "center" | "right" | "justify";

const ALIGN_CSS: Record<TParagraphAlign, TAlignCss> = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
};

const round = (value: number, decimals: number): number => {
  const k = 10 ** decimals;
  return Math.round(value * k) / k;
};

const pxOf = (value: string): number => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

/** Стиль абзаца в CSS-виде. Общий источник правды для холста и «Образца». */
export interface IParagraphCss {
  textAlign: TAlignCss;
  marginLeft: string;
  marginRight: string;
  marginTop: string;
  marginBottom: string;
  textIndent: string;
  lineHeight: string;
}

const lineHeightCss = (fmt: IParagraphFormat): string => {
  switch (fmt.lineMode) {
    case "single":
      return "1";
    case "onehalf":
      return "1.5";
    case "double":
      return "2";
    case "exactly":
      return `${round(fmt.lineValue, 2)}pt`;
    // «Минимум» — высота строки не меньше заданной, но и не меньше того, что
    // нужно самому шрифту. В CSS нет отдельного свойства, поэтому берём максимум
    // из естественной высоты строки (≈1.2 кегля) и заданного значения.
    case "atLeast":
      return `max(1.2em, ${round(fmt.lineValue, 2)}pt)`;
    default:
      return String(round(fmt.lineValue, 2));
  }
};

export const paragraphCss = (fmt: IParagraphFormat): IParagraphCss => {
  const cm = (value: number) => `${round(value, 2)}cm`;
  const pt = (value: number) => `${round(value, 1)}pt`;
  return {
    textAlign: ALIGN_CSS[fmt.align],
    marginLeft: cm(fmt.indentLeft),
    marginRight: cm(fmt.indentRight),
    marginTop: pt(fmt.spaceBefore),
    marginBottom: pt(fmt.spaceAfter),
    textIndent:
      fmt.firstLine === "none"
        ? "0cm"
        : cm(fmt.firstLine === "hanging" ? -fmt.firstLineBy : fmt.firstLineBy),
    lineHeight: lineHeightCss(fmt),
  };
};

const levelOf = (el: HTMLElement): TParagraphLevel => {
  const match = /^H([1-6])$/.exec(el.tagName);
  return match ? (match[1] as TParagraphLevel) : "body";
};

// Смена уровня = смена тега блока с сохранением содержимого и атрибутов.
// Пункт списка уровнем не управляем: заголовок внутри <li> ломает и разметку
// списка, и структуру документа.
const setBlockLevel = (el: HTMLElement, level: TParagraphLevel): HTMLElement => {
  if (el.tagName === "LI" || levelOf(el) === level) return el;
  const next = document.createElement(level === "body" ? "p" : `h${level}`);
  Array.from(el.attributes).forEach((attr) =>
    next.setAttribute(attr.name, attr.value),
  );
  while (el.firstChild) next.appendChild(el.firstChild);
  el.replaceWith(next);
  return next;
};

const isFormattableBlock = (node: Node): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE &&
  !isSpacerNode(node) &&
  !isPageBreakNode(node) &&
  !isStampNode(node) &&
  !NON_PARAGRAPH_TAGS.has((node as HTMLElement).tagName);

// Список раскрывается в свои пункты: в Word настройки абзаца применяются к
// каждому пункту, а не к контейнеру списка.
const expandBlock = (el: HTMLElement): HTMLElement[] =>
  LIST_TAGS.has(el.tagName)
    ? Array.from(el.querySelectorAll<HTMLElement>("li"))
    : [el];

/**
 * Абзацы, которых касается выделение. Без выделения (каретка вне редактора) —
 * первый абзац документа, чтобы диалог всегда показывал реальные значения.
 */
export const collectParagraphTargets = (
  editor: HTMLElement,
  range: Range | null,
): HTMLElement[] => {
  const blocks = Array.from(editor.children).filter(isFormattableBlock);
  if (!range) {
    const first = blocks[0];
    return first ? expandBlock(first).slice(0, 1) : [];
  }
  return blocks
    .filter((block) => range.intersectsNode(block))
    .flatMap(expandBlock)
    .filter((block) => range.intersectsNode(block));
};

// Режим междустрочного интервала восстанавливаем по НЕвычисленному inline-стилю:
// вычисленный превращает и «Точно», и «Минимум» в одинаковые пиксели, а различить
// их можно только по исходной записи (max(...) — это «Минимум»).
const readLineSpacing = (
  block: HTMLElement,
  cs: CSSStyleDeclaration,
): Pick<IParagraphFormat, "lineMode" | "lineValue"> => {
  const raw = (block.style.lineHeight || "").trim();
  const atLeast = /^max\(\s*[\d.]+em\s*,\s*([\d.]+)pt\s*\)$/i.exec(raw);
  if (atLeast) return { lineMode: "atLeast", lineValue: round(+atLeast[1], 2) };
  const exactly = /^([\d.]+)pt$/i.exec(raw);
  if (exactly) return { lineMode: "exactly", lineValue: round(+exactly[1], 2) };

  const fontSize = pxOf(cs.fontSize) || 14;
  const lineHeight =
    cs.lineHeight === "normal" ? fontSize * 1.2 : pxOf(cs.lineHeight);
  const ratio = round((lineHeight || fontSize * BASE_LINE_HEIGHT) / fontSize, 2);
  if (ratio === 1) return { lineMode: "single", lineValue: 1 };
  if (ratio === 1.5) return { lineMode: "onehalf", lineValue: 1.5 };
  if (ratio === 2) return { lineMode: "double", lineValue: 2 };
  return { lineMode: "multiple", lineValue: ratio };
};

export const readParagraphFormat = (block: HTMLElement): IParagraphFormat => {
  const cs = window.getComputedStyle(block);
  const toCm = (value: string) => round(pxOf(value) / PX_PER_CM, 2);
  const toPt = (value: string) => round(pxOf(value) / PX_PER_PT, 1);

  const textAlign = cs.textAlign;
  const align: TParagraphAlign =
    textAlign === "center"
      ? "center"
      : textAlign === "right" || textAlign === "end"
        ? "right"
        : textAlign === "justify"
          ? "justify"
          : "left";

  const indentPx = pxOf(cs.textIndent);
  const firstLine =
    indentPx > 0.5 ? "indent" : indentPx < -0.5 ? "hanging" : "none";

  return {
    align,
    level: levelOf(block),
    indentLeft: toCm(cs.marginLeft),
    indentRight: toCm(cs.marginRight),
    firstLine,
    firstLineBy:
      firstLine === "none"
        ? DEFAULT_PARAGRAPH_FORMAT.firstLineBy
        : round(Math.abs(indentPx) / PX_PER_CM, 2),
    spaceBefore: toPt(cs.marginTop),
    spaceAfter: toPt(cs.marginBottom),
    ...readLineSpacing(block, cs),
    contextualSpacing: block.hasAttribute(CONTEXTUAL_SPACING_ATTR),
  };
};

/** Применяет настройки к абзацам; возвращает блоки после возможной смены тега. */
export const applyParagraphFormat = (
  targets: HTMLElement[],
  fmt: IParagraphFormat,
): HTMLElement[] => {
  const css = paragraphCss(fmt);
  return targets.map((target) => {
    const block = setBlockLevel(target, fmt.level);
    Object.assign(block.style, css);
    if (fmt.contextualSpacing) {
      block.setAttribute(CONTEXTUAL_SPACING_ATTR, "1");
    } else {
      block.removeAttribute(CONTEXTUAL_SPACING_ATTR);
    }
    return block;
  });
};
