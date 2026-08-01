import {
  blockAcrossPageBoundary,
  caretAtBlockEnd,
  caretAtBlockStart,
  topLevelBlockOf,
} from "./editorBlocks";
import { charPosAt } from "./editorCaret";
import { EDITOR_ATOMIC_TAGS } from "./editorTags";
import type { TEditorKeyHandler } from "./editorKeyModel";

/**
 * Стрелки на границе страниц: между блоками стоит невидимая распорка
 * (contenteditable=false, большая высота). Вертикальная навигация браузера
 * геометрическая — каретка «проваливается» в пустоту распорки и застревает,
 * требуя второго нажатия. Перехватываем ТОЛЬКО когда каретка на краю блока
 * и за границей действительно есть распорка/разрыв: тогда ставим её в
 * начало/конец соседнего блока. Мид-блочную навигацию не трогаем (caretAt*
 * истинны лишь на первой/последней визуальной строке блока).
 */
export const handleArrowKey: TEditorKeyHandler = (e, editor) => {
  if (
    e.key !== "ArrowDown" &&
    e.key !== "ArrowUp" &&
    e.key !== "ArrowRight" &&
    e.key !== "ArrowLeft"
  )
    return false;

  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return true;
  if (!editor) return true;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return true;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return true;
  const block = topLevelBlockOf(editor, range.startContainer);
  if (!block) return true;

  const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
  const atEdge = forward
    ? caretAtBlockEnd(block, range)
    : caretAtBlockStart(block, range);
  if (!atEdge) return true;

  const neighbour = blockAcrossPageBoundary(block, forward ? "next" : "prev");
  if (!neighbour) return true;

  // Список — крайний пункт; атомарный блок (таблица/картинка) отдаём дефолту.
  let target: HTMLElement = neighbour;
  if (neighbour.tagName === "UL" || neighbour.tagName === "OL") {
    const li = forward
      ? neighbour.firstElementChild
      : neighbour.lastElementChild;
    if (!li) return true;
    target = li as HTMLElement;
  } else if (EDITOR_ATOMIC_TAGS.has(neighbour.tagName)) {
    return true;
  }

  const pos = forward
    ? charPosAt(target, 0)
    : charPosAt(target, (target.textContent || "").length);
  e.preventDefault();
  const r = document.createRange();
  r.setStart(pos.node, pos.offset);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
  return true;
};
