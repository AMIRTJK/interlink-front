import { AUTOSPLIT_ATTR } from "../../lib/constants";
import { caretAtBlockEnd, topLevelBlockOf } from "./editorBlocks";
import { charPosAt } from "./editorCaret";
import { nextSplitGroupId } from "./editorSplitGroup";
import { closestLiOf } from "./editorTabs";
import { PAGE_SPLITTABLE_TAGS } from "./editorTags";
import type { TEditorKeyHandler } from "./editorKeyModel";

/**
 * Shift+Enter — мягкий перенос строки внутри абзаца (soft return), как в
 * Word: один <br>, без завершения абзаца. Перехватываем ради единообразия
 * между браузерами и корректной установки каретки (в конце блока нужен
 * «якорный» <br>, иначе каретка не встаёт на новую строку).
 */
export const handleSoftBreakKey: TEditorKeyHandler = (
  e,
  editor,
  { syncEditorAfterDomEdit },
) => {
  if (!(e.key === "Enter" && e.shiftKey)) return false;

  e.preventDefault();
  if (!editor || !editor.isContentEditable) return true;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return true;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return true;
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);
  range.setStartAfter(br);
  range.collapse(true);
  const brBlock = topLevelBlockOf(editor, br);
  if (brBlock && caretAtBlockEnd(brBlock, range)) {
    const anchor = document.createElement("br");
    br.after(anchor);
    range.setStartBefore(anchor);
    range.collapse(true);
  }
  selection.removeAllRanges();
  selection.addRange(range);
  syncEditorAfterDomEdit();
  return true;
};

/**
 * Enter на ПУСТОМ пункте списка — выход из списка (как в Word): outdent
 * либо понижает уровень вложенного пункта, либо выносит пункт из списка
 * обычным блоком. Непустые пункты обрабатывает нативный split (Enter не
 * перехватываем — наследование формата идёт через defaultParagraphSeparator).
 */
export const handleEnterKey: TEditorKeyHandler = (
  e,
  editor,
  { commitHistoryNow, execCmd, syncEditorAfterDomEdit },
) => {
  if (!(e.key === "Enter" && !e.shiftKey)) return false;
  if (!editor || !editor.isContentEditable) return false;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed)
    return false;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return false;

  const li = closestLiOf(editor, range.startContainer);
  if (li && !(li.textContent || "").trim() && !li.querySelector("img,table")) {
    e.preventDefault();
    commitHistoryNow();
    execCmd("outdent");
    syncEditorAfterDomEdit();
    return true;
  }

  // Enter внутри блока, разрезанного пагинацией по границе страницы
  // (data-page-split): нативный split создаёт новый блок, который
  // наследует id группы, и шаг слияния пагинации склеивает половины
  // обратно — перенос «мерцал и откатывался». Делим блок сами и
  // разводим половины по разным группам: всё до курсора остаётся в
  // старой группе (абзац до переноса), курсорный хвост и нижележащие
  // куски получают новый id (абзац после переноса) — слияние их уже
  // не соединит, а пагинация переразложит по страницам заново.
  const block = topLevelBlockOf(editor, range.startContainer);
  const gid = block?.getAttribute(AUTOSPLIT_ATTR) || null;
  if (!block || !gid || !PAGE_SPLITTABLE_TAGS.has(block.tagName)) return false;

  e.preventDefault();
  commitHistoryNow();

  const pieces = Array.from(
    editor.querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}="${gid}"]`),
  );
  const k = pieces.indexOf(block);
  const hasBefore = k > 0;
  const hasAfter = k >= 0 && k < pieces.length - 1;

  // Хвост блока (после курсора) уносим в блок-клон.
  const cut = document.createRange();
  cut.setStart(range.startContainer, range.startOffset);
  cut.setEnd(block, block.childNodes.length);
  const next = block.cloneNode(false) as HTMLElement;
  next.appendChild(cut.extractContents());

  // Пустую половину держит placeholder <br> — но только если она не
  // сольётся с соседями по своей группе (иначе лишняя пустая строка).
  if (
    !hasBefore &&
    !(block.textContent || "").length &&
    !block.querySelector("br,img")
  ) {
    block.appendChild(document.createElement("br"));
  }
  if (
    !hasAfter &&
    !(next.textContent || "").length &&
    !next.querySelector("br,img")
  ) {
    next.appendChild(document.createElement("br"));
  }

  block.after(next);

  // Разводим группы: старый id — по курсорный блок включительно,
  // новый id — клон next и все нижележащие куски прежней группы.
  const newGid = nextSplitGroupId();
  next.setAttribute(AUTOSPLIT_ATTR, newGid);
  for (let j = k + 1; j < pieces.length; j++) {
    pieces[j].setAttribute(AUTOSPLIT_ATTR, newGid);
  }

  const pos = charPosAt(next, 0);
  const caret = document.createRange();
  caret.setStart(pos.node, pos.offset);
  caret.collapse(true);
  selection.removeAllRanges();
  selection.addRange(caret);

  syncEditorAfterDomEdit();
  return true;
};
