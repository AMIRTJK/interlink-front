import {
  isPageBreakNode,
  isSpacerNode,
  isStampNode,
} from "./editorTags";

// Верхнеуровневый блок редактора, содержащий узел
export const topLevelBlockOf = (
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null => {
  let n: Node | null = node;
  while (n && n.parentNode !== editor) n = n.parentNode;
  return n && n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement) : null;
};

// Узел, который при поиске реального содержимого не считается: служебные
// распорки и разрывы страниц, печать ЭЦП (вне потока) и пробельные текстовые
// узлы между блоками.
export const isSkippableSibling = (n: Node): boolean =>
  isSpacerNode(n) ||
  isPageBreakNode(n) ||
  isStampNode(n) ||
  (n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim());

// Соседний РЕАЛЬНЫЙ блок за границей страницы: идём по сиблингам, пропуская
// распорки/разрывы/печати ЭЦП/пустой текст. Возвращаем блок, ТОЛЬКО если по пути
// пересекли распорку или разрыв страницы (иначе граница страницы ни при чём и
// коррекция каретки не нужна — дефолт браузера справится сам).
export const blockAcrossPageBoundary = (
  block: HTMLElement,
  dir: "next" | "prev",
): HTMLElement | null => {
  const step = (n: ChildNode | null) =>
    dir === "next" ? n?.nextSibling ?? null : n?.previousSibling ?? null;
  let n: ChildNode | null = step(block);
  let crossed = false;
  while (n) {
    if (isSpacerNode(n) || isPageBreakNode(n)) crossed = true;
    else if (!isSkippableSibling(n)) break;
    n = step(n);
  }
  if (!crossed || !n || n.nodeType !== Node.ELEMENT_NODE) return null;
  return n as HTMLElement;
};

// Есть ли в диапазоне видимое содержимое (текст / br / атомарные элементы)
export const rangeHasContent = (r: Range): boolean => {
  if (r.toString().length > 0) return true;
  const frag = r.cloneContents();
  return !!frag.querySelector("br, img, table, figure, video, canvas, svg");
};

// Каретка стоит в самом начале блока (перед ней нет видимого содержимого)
export const caretAtBlockStart = (block: HTMLElement, range: Range): boolean => {
  const pre = range.cloneRange();
  pre.selectNodeContents(block);
  pre.setEnd(range.startContainer, range.startOffset);
  return !rangeHasContent(pre);
};

// Каретка в конце блока: после неё нет содержимого, кроме <br>-плейсхолдера
export const caretAtBlockEnd = (block: HTMLElement, range: Range): boolean => {
  const post = range.cloneRange();
  post.selectNodeContents(block);
  post.setStart(range.endContainer, range.endOffset);
  if (post.toString().length > 0) return false;
  const frag = post.cloneContents();
  if (frag.querySelector("img, table, figure, video, canvas, svg"))
    return false;
  return frag.querySelectorAll("br").length <= 1;
};
