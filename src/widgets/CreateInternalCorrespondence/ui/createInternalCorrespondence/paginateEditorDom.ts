import { AUTOSPLIT_ATTR, PAGE_BREAK_ATTR, SPACER_ATTR } from "../../lib/constants";
import { removeSpacerSafely } from "./editorCaret";
import {
  EDITOR_ATOMIC_TAGS,
  EDITOR_BLOCK_TAGS,
  PAGE_SPLITTABLE_TAGS,
} from "./editorTags";
import { createCaretKeeper } from "./editorCaretKeeper";
import { createBlockSplitters, makeSpacer } from "./editorPageSplitters";

interface PaginateGeometry {
  /** Высота печатной области листа без вертикальных полей. */
  contentHeight: number;
  /** Шаг листа: высота страницы плюс визуальный зазор между листами. */
  pageStride: number;
}

/**
 * Постраничная разбивка редактора. Абзац, не влезающий до конца страницы,
 * делится: влезающие строки остаются, хвост уезжает за распорку на следующий
 * лист (с сохранением разметки; части склеиваются при сохранении). Списки
 * делятся по пунктам, таблицы — по строкам, атомарные блоки переносятся
 * целиком. Курсор сохраняется структурно + сверяется по смещению в символах.
 *
 * Возвращает количество страниц.
 */
export const paginateEditorDom = (
  editor: HTMLElement,
  { contentHeight, pageStride }: PaginateGeometry,
): number => {
  const { caretSnapshot, caretChars, restoreCaretHybrid } =
    createCaretKeeper(editor);
  let textMutated = false;

  // 1. Убираем старые распорки и собираем ранее разрезанные блоки обратно
  editor.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => {
    if (removeSpacerSafely(n)) textMutated = true;
  });

  const groups = new Map<string, HTMLElement[]>();
  editor.querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}]`).forEach((el) => {
    const gid = el.getAttribute(AUTOSPLIT_ATTR) || "";
    const arr = groups.get(gid) || [];
    arr.push(el);
    groups.set(gid, arr);
  });
  groups.forEach((pieces) => {
    const first = pieces[0];
    first.removeAttribute(AUTOSPLIT_ATTR);
    for (let k = 1; k < pieces.length; k++) {
      let child = pieces[k].firstChild;
      while (child) {
        first.appendChild(child);
        child = pieces[k].firstChild;
      }
      pieces[k].remove();
    }
    first.normalize();
    textMutated = true;
  });

  // Контент помещается на один лист и нет ручных разрывов
  if (
    editor.scrollHeight <= contentHeight &&
    !editor.querySelector(`[${PAGE_BREAK_ATTR}]`)
  ) {
    if (textMutated) restoreCaretHybrid();
    return 1;
  }

  // 2. «Голый» текст и инлайн-узлы заворачиваем в блок <p>
  let buf: Node[] = [];
  const flushBuf = () => {
    if (!buf.length) return;
    const div = document.createElement("p");
    buf[0].parentNode?.insertBefore(div, buf[0]);
    buf.forEach((n) => div.appendChild(n));
    buf = [];
    textMutated = true;
  };
  Array.from(editor.childNodes).forEach((node) => {
    const isBlock =
      node.nodeType === Node.ELEMENT_NODE &&
      EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
    if (isBlock) flushBuf();
    else buf.push(node);
  });
  flushBuf();

  const { splitTableByRows, splitListByItems, splitBlockToBudget } =
    createBlockSplitters(editor, pageStride);

  // 3. Раскладка по страницам
  let i = 0;
  let guard = 0;
  while (i < editor.children.length && guard < 8000) {
    guard++;
    const block = editor.children[i] as HTMLElement;
    if (block.hasAttribute(SPACER_ATTR)) {
      i++;
      continue;
    }
    if (block.hasAttribute(PAGE_BREAK_ATTR)) {
      const top = block.offsetTop;
      const page = Math.floor(top / pageStride);
      editor.insertBefore(
        makeSpacer((page + 1) * pageStride - top),
        block.nextSibling,
      );
      i += 2;
      continue;
    }
    if (
      block.hasAttribute("data-signature-stamp") ||
      getComputedStyle(block).position === "absolute"
    ) {
      i++;
      continue;
    }
    const top = block.offsetTop;
    const h = block.offsetHeight;
    const page = Math.floor(top / pageStride);
    const pageStart = page * pageStride;
    const usableBottom = pageStart + contentHeight;
    const overflows = top >= usableBottom || top + h > usableBottom;

    if (!overflows) {
      i++;
      continue;
    }

    const tag = block.tagName;

    // Таблицы паджинируем по строкам (атомарны для посимвольного деления).
    if (tag === "TABLE") {
      // Влезает в лист целиком, но не до конца текущей страницы — переносим.
      if (h <= contentHeight && top > pageStart + 2) {
        editor.insertBefore(makeSpacer((page + 1) * pageStride - top), block);
        i++;
        continue;
      }
      // Выше печатной области листа — режем по строкам.
      if (splitTableByRows(block, usableBottom, page, pageStart)) {
        textMutated = true;
      }
      i++;
      continue;
    }

    // Списки делим по пунктам: часть остаётся, хвост уезжает на новый лист.
    if (tag === "UL" || tag === "OL") {
      if (splitListByItems(block, usableBottom, page, pageStart)) {
        textMutated = true;
      }
      i++;
      continue;
    }

    // Блок начинается уже за печатной областью (в зазоре между листами) —
    // сдвигаем его на начало следующей страницы.
    if (top >= usableBottom) {
      editor.insertBefore(makeSpacer((page + 1) * pageStride - top), block);
      i++;
      continue;
    }

    const splittable =
      PAGE_SPLITTABLE_TAGS.has(tag) &&
      !EDITOR_ATOMIC_TAGS.has(tag) &&
      (block.textContent || "").trim().length > 0;

    // Пробуем отрезать влезающую часть блока в остаток текущей страницы:
    // абзац перетекает на следующий лист построчно, как в Word. Раньше блок
    // выше страницы целиком уезжал на следующий лист, оставляя предыдущую
    // страницу почти пустой (например, после смены размера шрифта).
    //
    // Резать слово по буквам разрешаем только блоку, стоящему в начале листа:
    // в остаток страницы не влезло ни одного слова — блок уедет на следующую
    // страницу целиком (ветка ниже) и будет поделён уже там, по полному листу.
    const atPageStart = top <= pageStart + 2;
    if (
      splittable &&
      splitBlockToBudget(block, usableBottom - top, page, atPageStart)
    ) {
      textMutated = true;
      i++;
      continue;
    }

    // Не делится (атомарный, пустой, или в остаток не влезло ни одного целого
    // слова) — переносим целиком на следующую страницу.
    if (!atPageStart) {
      editor.insertBefore(makeSpacer((page + 1) * pageStride - top), block);
      i++;
      continue;
    }

    i++;
  }

  // Восстанавливаем позицию курсора: структурно + сверка по символам
  if (textMutated || caretSnapshot || caretChars) {
    restoreCaretHybrid();
  }

  return Math.max(1, Math.ceil(editor.scrollHeight / pageStride));
};
