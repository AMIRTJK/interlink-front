import { isSkippableSibling, topLevelBlockOf } from "./editorBlocks";
import { charPosAt } from "./editorCaret";
import { isPageBreakNode, isSpacerNode } from "./editorTags";

// Габариты узла в координатах вьюпорта: у текстового узла своего rect нет,
// меряем его диапазоном.
const nodeRect = (n: Node): DOMRect => {
  if (n.nodeType === Node.ELEMENT_NODE)
    return (n as HTMLElement).getBoundingClientRect();
  const r = document.createRange();
  r.selectNodeContents(n);
  return r.getBoundingClientRect();
};

// Ближайший узел с реальным содержимым среди детей редактора, начиная с
// индекса `from` в направлении `step`.
const contentNodeFrom = (
  editor: HTMLElement,
  from: number,
  step: 1 | -1,
): Node | null => {
  const kids = editor.childNodes;
  for (let k = from; k >= 0 && k < kids.length; k += step) {
    if (!isSkippableSibling(kids[k])) return kids[k];
  }
  return null;
};

// Позиция каретки на краю содержимого: у списка — крайний пункт, у пустого
// блока — нулевое смещение (за <br>-плейсхолдером каретке делать нечего),
// иначе первый/последний символ.
const edgePosition = (
  node: Node,
  edge: "start" | "end",
): { node: Node; offset: number } => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    const length = (node.textContent || "").length;
    return { node, offset: edge === "start" ? 0 : length };
  }

  let el = node as HTMLElement;
  if (el.tagName === "UL" || el.tagName === "OL") {
    const li = edge === "start" ? el.firstElementChild : el.lastElementChild;
    if (li) el = li as HTMLElement;
  }
  if (!(el.textContent || "").length) return { node: el, offset: 0 };
  return charPosAt(el, edge === "start" ? 0 : (el.textContent || "").length);
};

/**
 * Клик в пустоту между страницами. Остаток листа под последней строкой занимает
 * служебная распорка (`data-page-spacer`, contenteditable=false), поэтому по
 * клику туда браузер ставит каретку не в текст, а на верхний уровень редактора —
 * рядом с распоркой. Визуально это строка ниже последней строки листа, где
 * текста нет и быть не может: набранный там символ оказался бы вне печатной
 * области, пока его не подберёт следующая пагинация. Возвращаем каретку в
 * ближайшее содержимое — в конец блока выше или в начало блока ниже, смотря
 * куда пришёлся клик (граница между листами приходится примерно на середину
 * распорки: она перекрывает нижнее поле листа, зазор и верхнее поле следующего).
 *
 * Тот же провал каретки для вертикальных стрелок закрывает handleArrowKey.
 * Возвращает true, если каретку пришлось переставить.
 */
export const snapCaretOutOfPageGap = (
  editor: HTMLElement,
  clientY: number,
): boolean => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return false;

  // Каретка вне текста бывает только двумя способами: позиция между детьми
  // редактора и позиция внутри самой распорки/разрыва страницы. Всё остальное —
  // нормальный клик в блок, вмешиваться не нужно.
  let prevFrom: number;
  let nextFrom: number;
  if (range.startContainer === editor) {
    prevFrom = range.startOffset - 1;
    nextFrom = range.startOffset;
  } else {
    const block = topLevelBlockOf(editor, range.startContainer);
    if (!block || !(isSpacerNode(block) || isPageBreakNode(block))) return false;
    const index = Array.from(editor.childNodes).indexOf(block);
    prevFrom = index - 1;
    nextFrom = index + 1;
  }

  const prev = contentNodeFrom(editor, prevFrom, -1);
  const next = contentNodeFrom(editor, nextFrom, 1);
  const distToPrev = prev ? Math.abs(clientY - nodeRect(prev).bottom) : Infinity;
  const distToNext = next ? Math.abs(nodeRect(next).top - clientY) : Infinity;
  const target = distToPrev <= distToNext ? prev : next;
  if (!target) return false;

  const pos = edgePosition(target, target === prev ? "end" : "start");
  const r = document.createRange();
  r.setStart(pos.node, pos.offset);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
  return true;
};
