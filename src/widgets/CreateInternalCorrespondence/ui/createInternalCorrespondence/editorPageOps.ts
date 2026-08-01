import { AUTOSPLIT_ATTR, PAGE_BREAK_ATTR } from "../../lib/constants";
import { topLevelBlockOf } from "./editorBlocks";
import {
  EDITOR_BLOCK_TAGS,
  PAGE_SPLITTABLE_TAGS,
  isPageBreakNode,
  isSpacerNode,
  isStampNode,
} from "./editorTags";
import { wrapBareTopLevelNodes } from "./editorCaret";

const makeEmptyPara = () => {
  const p = document.createElement("p");
  p.appendChild(document.createElement("br"));
  return p;
};

/**
 * Ручной разрыв страницы: текст после курсора начинается с нового листа.
 * Сам маркер невидим (нулевая высота), break-after — для печати/экспорта.
 * Каретка остаётся в начале содержимого новой страницы.
 */
export const insertPageBreakAtCaret = (editor: HTMLElement) => {
  const breakEl = document.createElement("div");
  breakEl.setAttribute(PAGE_BREAK_ATTR, "1");
  breakEl.setAttribute("contenteditable", "false");
  breakEl.setAttribute("aria-hidden", "true");
  breakEl.style.cssText =
    "height:0;line-height:0;font-size:0;break-after:page;page-break-after:always;user-select:none;-webkit-user-select:none;pointer-events:none;";

  const sel = window.getSelection();
  const range =
    sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)
      ? sel.getRangeAt(0)
      : null;
  const block = range ? topLevelBlockOf(editor, range.startContainer) : null;

  let caretNode: Node;

  if (range && block && PAGE_SPLITTABLE_TAGS.has(block.tagName)) {
    // Блок с курсором делим на «до/после»: хвост уезжает на новую страницу.
    // Если блок был частью авторазреза — расформировываем группу, иначе
    // очистка HTML склеит куски обратно поверх ручного разрыва.
    const gid = block.getAttribute(AUTOSPLIT_ATTR);
    if (gid) {
      editor
        .querySelectorAll(`[${AUTOSPLIT_ATTR}="${gid}"]`)
        .forEach((el) => el.removeAttribute(AUTOSPLIT_ATTR));
    }
    const tail = document.createRange();
    tail.setStart(range.endContainer, range.endOffset);
    tail.setEnd(block, block.childNodes.length);
    const frag = tail.extractContents();
    const next = block.cloneNode(false) as HTMLElement;
    next.removeAttribute(AUTOSPLIT_ATTR);
    next.appendChild(frag);
    if (!(next.textContent || "").length && !next.querySelector("br,img")) {
      next.appendChild(document.createElement("br"));
    }
    if (!(block.textContent || "").length && !block.querySelector("br,img")) {
      block.appendChild(document.createElement("br"));
    }
    block.after(breakEl, next);
    caretNode = next;
  } else if (block) {
    // Списки/таблицы не делим — разрыв после всего блока + пустой абзац
    const para = makeEmptyPara();
    block.after(breakEl, para);
    caretNode = para;
  } else if (range) {
    // «Голый» текст на верхнем уровне (до первого Enter) — делим текстовый узел
    let topNode: Node | null = range.startContainer;
    while (topNode && topNode.parentNode !== editor) topNode = topNode.parentNode;
    if (topNode && topNode.nodeType === Node.TEXT_NODE) {
      const textNode = topNode as Text;
      const splitAt =
        range.startContainer === textNode ? range.startOffset : textNode.length;
      const tailText = textNode.splitText(splitAt);
      textNode.after(breakEl);
      if (tailText.length === 0) {
        tailText.remove();
        const para = makeEmptyPara();
        breakEl.after(para);
        caretNode = para;
      } else {
        caretNode = tailText;
      }
    } else {
      const para = makeEmptyPara();
      editor.append(breakEl, para);
      caretNode = para;
    }
  } else {
    const para = makeEmptyPara();
    editor.append(breakEl, para);
    caretNode = para;
  }

  const r = document.createRange();
  r.setStart(caretNode, 0);
  r.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(r);
};

/**
 * Убирает верхнеуровневые блоки, визуально расположенные на странице
 * `pageIndex`, плюс ручной разрыв, который её породил. Возвращает false, если
 * удалять оказалось нечего — тогда пересчёт разбивки не нужен.
 */
export const removePageBlocks = (
  editor: HTMLElement,
  pageIndex: number,
  pageStride: number,
): boolean => {
  const children = Array.from(editor.children);
  const removals: Element[] = [];
  let firstIdx = -1;

  children.forEach((child, idx) => {
    if (isSpacerNode(child)) return; // распорки пересоздаются при пагинации
    // печать ЭЦП и прочие абсолютные элементы не трогаем
    if (isStampNode(child) || getComputedStyle(child).position === "absolute")
      return;
    const el = child as HTMLElement;
    const page = Math.floor((el.offsetTop + el.offsetHeight / 2) / pageStride);
    if (page === pageIndex) {
      removals.push(child);
      if (firstIdx === -1) firstIdx = idx;
    }
  });

  // Ручной разрыв, создавший эту страницу, удаляем вместе с её содержимым
  if (firstIdx > 0) {
    let j = firstIdx - 1;
    while (j >= 0 && isSpacerNode(children[j])) j--;
    if (j >= 0 && isPageBreakNode(children[j])) removals.push(children[j]);
  }

  if (!removals.length) return false;
  removals.forEach((n) => n.remove());

  // Не оставляем редактор полностью пустым — иначе ломаются курсор/плейсхолдер
  if (!editor.textContent?.trim() && !editor.querySelector("img,table,br")) {
    editor.innerHTML = "<div><br></div>";
  }

  return true;
};

/**
 * Вставка готового DOM-фрагмента в позицию курсора (или в конец, если фокуса
 * нет). Каретка остаётся после вставленного содержимого.
 */
export const insertFragmentIntoEditor = (
  editor: HTMLElement,
  fragment: DocumentFragment,
) => {
  const selection = window.getSelection();
  let range: Range;
  if (
    selection &&
    selection.rangeCount > 0 &&
    editor.contains(selection.anchorNode)
  ) {
    range = selection.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
  }
  range.deleteContents();

  // Блочный контент (импорт Word, вставка многостраничного документа) должен
  // ложиться ВЕРХНЕУРОВНЕВЫМИ блоками редактора. После очистки (CTRL+A+Delete)
  // редактор сбрасывается в пустой блок-плейсхолдер <div><br></div>, и каретка
  // стоит ВНУТРИ него. Тогда range.insertNode вложил бы все абзацы документа
  // в этот один <div>: постраничная разбивка считает его одним «гигантским»
  // блоком, режет по тексту (теряя форматирование), а печать сваливает всё на
  // первую страницу и обрезает не влезшее (пропадал нижний текст письма).
  // Поэтому, если каретка в пустом плейсхолдере, поднимаем точку вставки на
  // уровень редактора и убираем плейсхолдер.
  const fragmentHasBlocks = Array.from(fragment.childNodes).some(
    (n) =>
      n.nodeType === Node.ELEMENT_NODE &&
      EDITOR_BLOCK_TAGS.has((n as HTMLElement).tagName),
  );
  let placeholder: HTMLElement | null = null;
  if (fragmentHasBlocks && range.startContainer !== editor) {
    const topBlock = topLevelBlockOf(editor, range.startContainer);
    if (
      topBlock &&
      !(topBlock.textContent || "").trim() &&
      !topBlock.querySelector("img,table,hr")
    ) {
      placeholder = topBlock;
      range = document.createRange();
      range.setStartBefore(topBlock);
      range.collapse(true);
    }
  }

  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  placeholder?.remove();

  // Инлайновые куски вставки, оказавшиеся на верхнем уровне редактора,
  // сразу заворачиваем в блоки: «голые» узлы ломают структурный снимок
  // каретки и постраничную разбивку (см. wrapBareTopLevelNodes).
  wrapBareTopLevelNodes(editor);

  // Курсор после вставленного содержимого
  if (lastNode && editor.contains(lastNode)) {
    const after = document.createRange();
    after.setStartAfter(lastNode);
    after.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(after);
  }
};
