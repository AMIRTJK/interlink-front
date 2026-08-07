/**
 * Вычисляет размер шрифта текущего выделения/каретки в стиле Microsoft Word:
 * - Если выделение в одной точке (курсор): возвращает точный размер шрифта в этой точке (например, "14").
 * - Если выделен фрагмент, у которого ВСЕ символы одинакового размера: возвращает этот размер (например, "14").
 * - Если выделение содержит символы с разными размерами шрифта: возвращает "" (смешанное форматирование Word).
 */
export const getSelectionFontSize = (editor: HTMLElement): string => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
    return "14";
  }

  const range = sel.getRangeAt(0);

  const getPxSize = (node: Node | null): number | null => {
    if (!node) return null;
    const el: HTMLElement | null =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : node.parentElement;
    if (!el || !editor.contains(el)) return null;
    try {
      const fs = window.getComputedStyle(el).fontSize;
      if (!fs) return null;
      const num = parseFloat(fs);
      return isNaN(num) ? null : Math.round(num);
    } catch {
      return null;
    }
  };

  // Курсор в одной точке (без выделения диапазона)
  if (range.collapsed) {
    const size = getPxSize(sel.anchorNode);
    return size ? String(size) : "14";
  }

  // Выделен диапазон символов: собираем все текстовые узлы внутри range
  const commonAncestor =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement || editor;

  const walker = document.createTreeWalker(
    commonAncestor,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!editor.contains(node)) return NodeFilter.FILTER_REJECT;
        if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  if (textNodes.length === 0) {
    const size = getPxSize(range.startContainer);
    return size ? String(size) : "14";
  }

  let uniformSize: number | null = null;
  let isMixed = false;

  for (const node of textNodes) {
    let start = 0;
    let end = node.nodeValue?.length || 0;

    if (node === range.startContainer) {
      start = range.startOffset;
    }
    if (node === range.endContainer) {
      end = range.endOffset;
    }

    if (start >= end) continue;

    const sliceText = (node.nodeValue || "").slice(start, end);
    if (!sliceText || (sliceText.trim() === "" && sliceText.includes("\n"))) {
      continue;
    }

    const size = getPxSize(node);
    if (size === null) continue;

    if (uniformSize === null) {
      uniformSize = size;
    } else if (uniformSize !== size) {
      isMixed = true;
      break;
    }
  }

  if (isMixed) {
    return ""; // Смешанное форматирование Word -> пустая строка
  }

  return uniformSize !== null ? String(uniformSize) : "14";
};
