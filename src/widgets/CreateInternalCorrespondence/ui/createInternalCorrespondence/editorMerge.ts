import { EDITOR_ATOMIC_TAGS } from "./editorTags";

// Пустые inline-обёртки (<b></b>, <span></span> и т.п.), остающиеся после
// слияния/правок блоков, чистим — иначе каретка «залипает» в невидимом узле,
// а разметка распухает. Узлы с текстом или значимым содержимым (img/br/table)
// не трогаем. Порядок обхода — документный, remove() на уже удалённом узле
// (когда удалили родителя раньше ребёнка) безопасен.
export const EMPTY_INLINE_TAGS = new Set([
  "B",
  "I",
  "U",
  "S",
  "STRIKE",
  "EM",
  "STRONG",
  "SPAN",
  "SUB",
  "SUP",
  "FONT",
  "MARK",
  "SMALL",
]);
export const normalizeBlock = (el: HTMLElement) => {
  el.querySelectorAll("*").forEach((node) => {
    if (!EMPTY_INLINE_TAGS.has(node.tagName)) return;
    if ((node.textContent || "").length) return;
    if (node.querySelector("img,br,hr,table")) return;
    node.remove();
  });
  el.normalize();
};

// Слияние первого блока следующей страницы с последним блоком предыдущей —
// как при обычном Backspace внутри одной страницы.
export const mergePageBlocks = (target: HTMLElement, source: HTMLElement) => {
  if (target.lastChild && target.lastChild.nodeName === "BR") {
    target.removeChild(target.lastChild);
  }
  while (source.firstChild) target.appendChild(source.firstChild);
  source.remove();
  target.normalize();
};

// Слияние блоков через границу страницы с учётом списков и атомарных блоков.
// Возвращает позицию для курсора (точку склейки) или null, если слияние невозможно.
export const mergeAcrossBoundary = (
  target: HTMLElement,
  source: HTMLElement,
): { node: Node; offset: number } | null => {
  // Куда вливаем: для списка — в его последний пункт
  let t = target;
  if ((t.tagName === "UL" || t.tagName === "OL") && t.lastElementChild) {
    t = t.lastElementChild as HTMLElement;
  }
  if (EDITOR_ATOMIC_TAGS.has(t.tagName)) return null;

  // Что вливаем: из списка — только первый пункт (остальное остаётся списком)
  let s = source;
  let sourceList: HTMLElement | null = null;
  if (s.tagName === "UL" || s.tagName === "OL") {
    const firstLi = s.firstElementChild as HTMLElement | null;
    if (!firstLi) {
      s.remove();
      return { node: t, offset: t.childNodes.length };
    }
    sourceList = s;
    s = firstLi;
  } else if (EDITOR_ATOMIC_TAGS.has(s.tagName)) {
    return null;
  }

  const junction = (t.textContent || "").length;
  mergePageBlocks(t, s);
  normalizeBlock(t);
  if (sourceList && !sourceList.firstElementChild) sourceList.remove();
  return charPosAt(t, junction);
};
