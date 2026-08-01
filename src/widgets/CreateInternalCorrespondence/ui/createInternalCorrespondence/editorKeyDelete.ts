import {
  caretAtBlockEnd,
  caretAtBlockStart,
  topLevelBlockOf,
} from "./editorBlocks";
import { mergeAcrossBoundary } from "./editorMerge";
import {
  EDITOR_ATOMIC_TAGS,
  isPageBreakNode,
  isSpacerNode,
  isStampNode,
} from "./editorTags";
import type { TEditorKeyHandler } from "./editorKeyModel";

// Служебные узлы (распорки, печать ЭЦП, пустой текст) рядом с блоком
const collectBoundary = (start: ChildNode | null, dir: "prev" | "next") => {
  const spacers: ChildNode[] = [];
  let n = start;
  while (
    n &&
    (isSpacerNode(n) ||
      isStampNode(n) ||
      (n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim()))
  ) {
    if (isSpacerNode(n)) spacers.push(n);
    n = dir === "prev" ? n.previousSibling : n.nextSibling;
  }
  return { spacers, stop: n };
};

// Блок, в который можно влить соседний абзац. Атомарные блоки (img/table) и
// <hr> оставляем дефолту — там слияние абзацев неуместно.
const isMergeableStop = (stop: ChildNode | null): boolean =>
  !!stop &&
  stop.nodeType === Node.ELEMENT_NODE &&
  (stop as HTMLElement).tagName !== "HR" &&
  !EDITOR_ATOMIC_TAGS.has((stop as HTMLElement).tagName);

/**
 * Backspace/Delete на границе страниц — управляемое слияние блоков: дефолтное
 * поведение браузера рядом с contenteditable=false распоркой прыгает курсором
 * и теряет текст. Своё слияние работает и БЕЗ распорок (обычные соседние абзацы
 * на одной странице): дефолт браузера тянет формат из произвольной стороны и
 * ломает разметку, а mergeAcrossBoundary вливает блок в приёмник, СОХРАНЯЯ
 * формат приёмника (как в Word).
 */
export const handleDeleteKeys: TEditorKeyHandler = (
  e,
  editor,
  { commitHistoryNow, syncEditorAfterDomEdit },
) => {
  if (e.key !== "Backspace" && e.key !== "Delete") return false;
  if (!editor) return true;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return true;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return true;
  const block = topLevelBlockOf(editor, range.startContainer);
  if (!block) return true;

  const setCaret = (node: Node, offset: number) => {
    const r = document.createRange();
    r.setStart(node, offset);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  };

  if (e.key === "Backspace") {
    if (!caretAtBlockStart(block, range)) return true;
    const { spacers, stop } = collectBoundary(block.previousSibling, "prev");

    if (isPageBreakNode(stop)) {
      e.preventDefault();
      commitHistoryNow();
      stop.remove();
      spacers.forEach((s) => s.remove());
      syncEditorAfterDomEdit();
      return true;
    }

    if (!spacers.length && !isMergeableStop(stop)) return true;

    e.preventDefault();
    commitHistoryNow();
    spacers.forEach((s) => s.remove());
    if (stop && stop.nodeType === Node.ELEMENT_NODE) {
      const target = stop as HTMLElement;
      if (target.tagName === "HR") {
        target.remove();
      } else {
        const pos = mergeAcrossBoundary(target, block);
        if (pos) setCaret(pos.node, pos.offset);
      }
    }
    syncEditorAfterDomEdit();
    return true;
  }

  if (!caretAtBlockEnd(block, range)) return true;
  const { spacers, stop } = collectBoundary(block.nextSibling, "next");

  if (isPageBreakNode(stop)) {
    e.preventDefault();
    commitHistoryNow(); // набор до операции — отдельный шаг истории
    stop.remove();
    spacers.forEach((s) => s.remove());
    syncEditorAfterDomEdit();
    return true;
  }

  // Зеркально Backspace: своё слияние со следующим блоком и без распорок.
  if (!spacers.length && !isMergeableStop(stop)) return true;

  e.preventDefault();
  commitHistoryNow(); // набор до операции — отдельный шаг истории
  spacers.forEach((s) => s.remove());
  if (stop && stop.nodeType === Node.ELEMENT_NODE) {
    const nextBlock = stop as HTMLElement;
    if (nextBlock.tagName === "HR") {
      nextBlock.remove();
    } else {
      const pos = mergeAcrossBoundary(block, nextBlock);
      if (pos) setCaret(pos.node, pos.offset);
    }
  }
  syncEditorAfterDomEdit();
  return true;
};
