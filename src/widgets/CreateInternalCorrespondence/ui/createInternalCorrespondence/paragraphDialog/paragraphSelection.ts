import { charPosAt } from "../editorCaret";

// Сохранение выделения на время работы диалога «Абзац». Запоминаем не Range, а
// положение его границ в символах внутри самих абзацев: смена уровня заменяет
// узел целиком, и ссылки живого Range после неё указывают в никуда.
export interface IParagraphSelection {
  start: [blockIndex: number, offset: number];
  end: [blockIndex: number, offset: number];
}

const anchorOf = (
  targets: HTMLElement[],
  node: Node,
  offset: number,
): [number, number] => {
  const index = targets.findIndex((t) => t === node || t.contains(node));
  if (index === -1) return [0, 0];
  const measure = document.createRange();
  measure.selectNodeContents(targets[index]);
  try {
    measure.setEnd(node, offset);
  } catch {
    return [index, 0];
  }
  return [index, measure.toString().length];
};

export const readParagraphSelection = (
  targets: HTMLElement[],
  range: Range | null,
): IParagraphSelection | null => {
  if (!range || !targets.length) return null;
  return {
    start: anchorOf(targets, range.startContainer, range.startOffset),
    end: anchorOf(targets, range.endContainer, range.endOffset),
  };
};

export const restoreParagraphSelection = (
  blocks: HTMLElement[],
  saved: IParagraphSelection | null,
) => {
  if (!saved || !blocks.length) return;
  // Постраничная разбивка могла разрезать абзац и заменить узлы — тогда своё
  // выделение не навязываем, каретку уже восстановил пагинатор.
  if (blocks.some((block) => !block.isConnected)) return;
  const at = ([index, offset]: [number, number]) =>
    charPosAt(blocks[Math.min(index, blocks.length - 1)], offset);
  try {
    const start = at(saved.start);
    const end = at(saved.end);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch {
    // Границы могли «уехать» после смены тега — выделение не восстанавливаем,
    // содержимое от этого не страдает.
  }
};
