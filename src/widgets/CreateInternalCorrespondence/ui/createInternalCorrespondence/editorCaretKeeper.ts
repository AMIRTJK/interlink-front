import { SPACER_ATTR } from "../../lib/constants";
import { getCaretCharOffset, restoreCaretCharOffset } from "./editorCaret";

interface CaretStructureSnapshot {
  blockIndex: number;
  path: number[];
  offset: number;
}

/**
 * Снимок каретки для пагинации: структурный (индекс блока + путь по DOM) плюс
 * эталонный символьный. Пагинация переставляет/режет/клеит блоки, НЕ меняя сам
 * текст, поэтому абсолютное смещение в символах инвариантно. Структурный снимок
 * точнее в пустых блоках, но ломается, когда блоки сливаются/разрезаются
 * (сдвигаются индексы) — тогда после структурного восстановления позиция
 * сверяется по символам и чинится fallback'ом.
 *
 * Снимок делается в момент вызова, поэтому создавать keeper нужно до правок DOM.
 */
export const createCaretKeeper = (editor: HTMLElement) => {
  // --- Функция структурного сохранения курсора ---
  const saveCaretStructure = (): CaretStructureSnapshot | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode))
      return null;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;

    if (node === editor) {
      return { blockIndex: 0, path: [], offset: 0 };
    }

    // Находим родительский блок верхнего уровня (прямой потомок editor)
    let topBlock = node;
    while (topBlock && topBlock.parentNode !== editor) {
      topBlock = topBlock.parentNode!;
    }
    if (!topBlock) return null;
    // «Голый» текстовый узел верхнего уровня (например, сразу после вставки
    // plain-text): структурный путь не работает — editor.children содержит
    // только элементы, и индекс блока посчитался бы неверно. Позицию
    // восстановит символьный fallback (getCaretCharOffset) ниже.
    if (topBlock.nodeType !== Node.ELEMENT_NODE) return null;

    // Считаем индекс этого блока среди всех детей, игнорируя распорки spacer
    const children = Array.from(editor.children);
    let blockIndex = 0;
    for (const child of children) {
      if (child === topBlock) break;
      if (!child.hasAttribute(SPACER_ATTR)) {
        blockIndex++;
      }
    }

    // Запоминаем путь от topBlock до целевого узла (node)
    const path: number[] = [];
    let current = node;
    while (current !== topBlock) {
      const parent = current.parentNode;
      if (!parent) break;
      const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
      path.unshift(index);
      current = parent;
    }

    return { blockIndex, path, offset };
  };

  // --- Функция структурного восстановления курсора ---
  const restoreCaretStructure = (snapshot: CaretStructureSnapshot | null) => {
    if (!snapshot) return;

    const children = Array.from(editor.children);
    let currentBlock: Element | null = null;
    let nonSpacerCount = 0;

    // Ищем блок по индексу, пропуская сервисные распорки spacers
    for (const child of children) {
      if (child.hasAttribute(SPACER_ATTR)) continue;
      if (nonSpacerCount === snapshot.blockIndex) {
        currentBlock = child;
        break;
      }
      nonSpacerCount++;
    }

    if (!currentBlock) {
      const validBlocks = children.filter((c) => !c.hasAttribute(SPACER_ATTR));
      currentBlock = validBlocks[validBlocks.length - 1] || editor;
    }

    // Спускаемся по сохраненному пути дерева DOM к нужному узлу
    let targetNode: Node = currentBlock;
    for (const idx of snapshot.path) {
      if (targetNode.childNodes[idx]) {
        targetNode = targetNode.childNodes[idx];
      } else {
        targetNode = targetNode.lastChild || targetNode;
        break;
      }
    }

    try {
      const range = document.createRange();
      const maxOffset =
        targetNode.nodeType === Node.TEXT_NODE
          ? targetNode.textContent?.length || 0
          : targetNode.childNodes.length;

      range.setStart(targetNode, Math.min(snapshot.offset, maxOffset));
      range.collapse(true);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch (e) {
      console.error("Ошибка восстановления каретки:", e);
    }
  };

  // Сохраняем положение курсора через структуру
  const caretSnapshot = saveCaretStructure();
  // Эталонный символьный снимок: пагинация переставляет/режет/клеит блоки,
  // НЕ меняя сам текст, поэтому абсолютное смещение в символах инвариантно.
  const caretChars = getCaretCharOffset(editor);

  const restoreCaretHybrid = () => {
    restoreCaretStructure(caretSnapshot);
    if (caretChars) {
      const after = getCaretCharOffset(editor);
      if (!after || after.offset !== caretChars.offset) {
        restoreCaretCharOffset(editor, caretChars);
      }
    }
  };

  return { caretSnapshot, caretChars, restoreCaretHybrid };
};
