import {
  AUTOSPLIT_ATTR,
  SPACER_ATTR,
  STAMP_ATTR,
} from "../../lib/constants";
import { EDITOR_BLOCK_TAGS } from "./editorTags";

// Снимок позиции курсора: абсолютное смещение в символах + признак того,
// что курсор стоял в начале своего текстового узла. На границе двух блоков
// одно и то же смещение означает и «конец предыдущего», и «начало следующего» —
// без признака курсор «перепрыгивал» в конец текста предыдущей страницы.
export type CaretSnapshot = { offset: number; preferNext: boolean } | null;

// Абсолютная позиция курсора в символах внутри редактора
export const getCaretCharOffset = (editor: HTMLElement): CaretSnapshot => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode))
    return null;
  const range = sel.getRangeAt(0);
  const pre = range.cloneRange();
  pre.selectNodeContents(editor);
  pre.setEnd(range.endContainer, range.endOffset);
  const preferNext =
    range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset === 0;
  return { offset: pre.toString().length, preferNext };
};

// Восстановление курсора по абсолютной позиции в символах
export const restoreCaretCharOffset = (editor: HTMLElement, caret: CaretSnapshot) => {
  if (caret == null) return;
  let remaining = caret.offset;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  let last: Node | null = null;
  const place = (n: Node, off: number) => {
    const range = document.createRange();
    range.setStart(n, off);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (remaining < len || (remaining === len && !caret.preferNext)) {
      place(node, remaining);
      return;
    }
    remaining -= len;
    last = node;
  }
  // Точная позиция не найдена (preferNext в самом конце документа) —
  // ставим курсор в конец последнего текстового узла.
  if (last) place(last, last.textContent?.length ?? 0);
};

// Позиция (узел, смещение) для абсолютного символьного индекса внутри элемента
export const charPosAt = (
  root: HTMLElement,
  k: number,
): { node: Node; offset: number } => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let acc = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (acc + len >= k) return { node, offset: k - acc };
    acc += len;
  }
  return { node: root, offset: root.childNodes.length };
};

// Удаление распорки без потери содержимого: браузер при Backspace/Delete на
// границе страниц может слить пользовательский текст внутрь распорки —
// в этом случае возвращаем его в поток обычным блоком.
// Возвращает true, если содержимое пришлось спасать.
export const removeSpacerSafely = (n: Element): boolean => {
  if ((n.textContent || "").trim()) {
    const div = document.createElement("p");
    while (n.firstChild) div.appendChild(n.firstChild);
    n.replaceWith(div);
    return true;
  }
  n.remove();
  return false;
};

// «Голый» текст и инлайн-узлы верхнего уровня заворачиваем в блочные <div>.
// Постраничная разбивка (getEditorPages) и печать перебирают только element-
// детей редактора, поэтому неупакованный текстовый узел (например, одиночная
// цифра «3», набранная в пустой редактор) не попадал ни на одну страницу и
// пропадал в предпросмотре и при печати. Пустые пробельные промежутки между
// блоками не трогаем, чтобы не плодить лишние пустые строки. Возвращает true,
// если структура была изменена.
export const wrapBareTopLevelNodes = (root: HTMLElement): boolean => {
  let mutated = false;
  let buf: Node[] = [];
  const flush = () => {
    if (!buf.length) return;
    const nodes = buf;
    buf = [];
    const meaningful = nodes.some(
      (n) =>
        n.nodeType === Node.ELEMENT_NODE ||
        (n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim() !== ""),
    );
    if (!meaningful) return;
    const div = document.createElement("p");
    nodes[0].parentNode?.insertBefore(div, nodes[0]);
    nodes.forEach((n) => div.appendChild(n));
    mutated = true;
  };
  Array.from(root.childNodes).forEach((node) => {
    const isBlock =
      node.nodeType === Node.ELEMENT_NODE &&
      EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
    if (isBlock) flush();
    else buf.push(node);
  });
  flush();
  return mutated;
};

// HTML → плоский текст для буфера обмена: блоки дают перевод строки, <br> → \n.
// Нужно для того, чтобы при копировании/вырезании text/plain не «слипался»
// (вставка в plain-поля должна сохранять переносы абзацев, как в Word).
export const htmlToPlainText = (html: string): string => {
  const d = document.createElement("div");
  d.innerHTML = html;
  d.querySelectorAll("br").forEach((br) =>
    br.replaceWith(document.createTextNode("\n")),
  );
  const blockSel = "p,div,h1,h2,h3,h4,h5,h6,li,tr,blockquote,pre";
  d.querySelectorAll(blockSel).forEach((b) => {
    if (b.nextSibling) b.appendChild(document.createTextNode("\n"));
  });
  return (d.textContent || "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n");
};

export const cleanEditorArtifacts = (html: string): string => {
  const w = document.createElement("div");
  w.innerHTML = html;

  w.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => removeSpacerSafely(n));
  w.querySelectorAll<HTMLElement>("[data-tab]").forEach((s) => {
    if (!s.textContent) s.remove();
  });

  const groups = new Map<string, HTMLElement[]>();
  w.querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}]`).forEach((el) => {
    // Если этот кусок принадлежит штампу ЭЦП, не трогаем его авторазбивки
    if (el.hasAttribute(STAMP_ATTR) || el.closest(`[${STAMP_ATTR}]`)) return;

    const gid = el.getAttribute(AUTOSPLIT_ATTR) || "";
    const arr = groups.get(gid) || [];
    arr.push(el);
    groups.set(gid, arr);
  });

  groups.forEach((pieces) => {
    const first = pieces[0];
    if (!first) return;
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
  });

  // Заворачиваем «голый» текст верхнего уровня, чтобы сохранённое тело письма
  // было корректно разложено на страницы при последующих просмотре/печати.
  wrapBareTopLevelNodes(w);

  return w.innerHTML;
};
