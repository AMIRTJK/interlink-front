// Шаг табуляции/красной строки ≈ позиция табуляции Word (1.27 см).
export const TAB_STEP_CM = 1.27;
export const NBSP = " ";

export const isTabSpacer = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).getAttribute("data-tab") === "1";

// Сколько неразрывных пробелов даёт ширину ≈ одного шага табуляции Word (1.27см)
// при текущем шрифте редактора. Ширину пробела меряем через canvas, без reflow.
let tabMeasureCanvas: HTMLCanvasElement | null = null;
export const tabNbspCount = (editor: HTMLElement): number => {
  const TARGET_PX = 48; // 1.27 см при 96 DPI
  try {
    const cs = getComputedStyle(editor);
    if (!tabMeasureCanvas) tabMeasureCanvas = document.createElement("canvas");
    const ctx = tabMeasureCanvas.getContext("2d");
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const w = ctx.measureText(NBSP).width || ctx.measureText(" ").width;
      if (w > 0) return Math.min(40, Math.max(2, Math.round(TARGET_PX / w)));
    }
  } catch {
    /* getComputedStyle/canvas недоступны — берём разумный дефолт */
  }
  return 12;
};

// Табулятор — прогон неразрывных пробелов в помеченном <span>. Почему не \t и не
// inline-block:
//  • \t выравнивается по сетке tab-size — после слова «схлопывался» до пробела;
//  • trailing-\t не подсвечивается при выделении (Ctrl+A «не видел» табуляцию);
//  • у inline-block фикс. ширины каретка залезала внутрь, и ввод переносился на
//    новую строку внутри коробки.
// Неразрывные пробелы лишены этих проблем: одинаковая ширина независимо от
// позиции, всегда подсвечиваются, не переносятся и не меняют высоту строки.
// Атомарность удаления обеспечивают обработчики клавиш (Backspace/Delete/
// Shift+Tab) по атрибуту data-tab.
export const makeTabSpacer = (count: number): HTMLElement => {
  const span = document.createElement("span");
  span.setAttribute("data-tab", "1");
  span.textContent = NBSP.repeat(Math.max(1, count));
  return span;
};

// Табулятор состоит ТОЛЬКО из неразрывных пробелов. Если каретка стояла на его
// правом краю, браузер печатает следующий символ внутрь спана — и тогда обычный
// пробел (или буква) становится частью табулятора: Backspace сносил бы его
// вместе с табуляцией одним нажатием, а выключка «по ширине» растягивала бы
// такой пробел, ломая ширину шага. Возвращаем чужие символы в поток сразу за
// табулятором. true — если что-то пришлось вынести.
export const normalizeTabSpacers = (root: HTMLElement): boolean => {
  let mutated = false;
  root.querySelectorAll<HTMLElement>("[data-tab]").forEach((span) => {
    const text = span.textContent || "";
    let keep = 0;
    while (keep < text.length && text[keep] === NBSP) keep++;
    if (keep === text.length && !span.children.length) return;

    const tail = document.createDocumentFragment();
    while (span.firstChild) tail.appendChild(span.firstChild);
    span.textContent = NBSP.repeat(keep);
    // Из вынесенного хвоста убираем те же keep символов — они остались в спане.
    const firstText = tail.firstChild;
    if (firstText && firstText.nodeType === Node.TEXT_NODE) {
      (firstText as Text).deleteData(0, keep);
      if (!(firstText as Text).data.length) firstText.remove();
    }
    span.after(tail);
    if (!keep) span.remove();
    mutated = true;
  });
  return mutated;
};

// Узел непосредственно слева от свёрнутой каретки (или null).
export const nodeBeforeCaret = (range: Range): Node | null => {
  if (!range.collapsed) return null;
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    return startOffset === 0 ? startContainer.previousSibling : null;
  }
  return startOffset > 0 ? startContainer.childNodes[startOffset - 1] : null;
};

// Узел непосредственно справа от свёрнутой каретки (или null).
export const nodeAfterCaret = (range: Range): Node | null => {
  if (!range.collapsed) return null;
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    return startOffset === (startContainer as Text).length
      ? startContainer.nextSibling
      : null;
  }
  return startContainer.childNodes[startOffset] ?? null;
};

// Табулятор, который надо удалить целиком при Backspace/Delete: тот, внутри
// которого стоит каретка, либо соседний слева ("prev") / справа ("next").
export const tabSpacerToDelete = (
  range: Range,
  dir: "prev" | "next",
): HTMLElement | null => {
  const host =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  const inside = host?.closest?.("[data-tab]") as HTMLElement | null;
  if (isTabSpacer(inside)) return inside;
  const sib = dir === "prev" ? nodeBeforeCaret(range) : nodeAfterCaret(range);
  return isTabSpacer(sib) ? sib : null;
};

// Удаление табулятора целиком с установкой каретки на его место.
export const removeTabSpacer = (
  span: HTMLElement,
  setCaret: (node: Node, offset: number) => void,
) => {
  const parent = span.parentNode as Node;
  const idx = Array.prototype.indexOf.call(parent.childNodes, span);
  span.remove();
  setCaret(parent, idx);
};

// Ближайший <li>, содержащий узел (в пределах редактора). null — вне списка.
export const closestLiOf = (
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null => {
  let n: Node | null =
    node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (n && n !== editor) {
    if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName === "LI")
      return n as HTMLElement;
    n = n.parentNode;
  }
  return null;
};

// Красная строка (first-line indent) блока в сантиметрах; 0 — если не задана в cm.
export const getTextIndentCm = (block: HTMLElement | null): number => {
  const v = block?.style?.textIndent || "";
  const m = /^(-?[\d.]+)cm$/.exec(v.trim());
  return m ? parseFloat(m[1]) : 0;
};

// Удаляет один табулятор слева от свёрнутой каретки. true — если удалил.
export const deleteTabBeforeCaret = (range: Range): boolean => {
  if (!range.collapsed) return false;
  const { startContainer, startOffset } = range;
  // а) символ табуляции в тексте (совместимость со старым форматом)
  if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
    const text = startContainer as Text;
    if (text.data[startOffset - 1] === "\t") {
      text.deleteData(startOffset - 1, 1);
      range.setStart(text, startOffset - 1);
      range.collapse(true);
      return true;
    }
  }
  // б) табулятор-спейсер слева (или тот, внутри которого стоит каретка)
  const spacer = tabSpacerToDelete(range, "prev");
  if (spacer) {
    removeTabSpacer(spacer, (node, offset) => {
      range.setStart(node, offset);
      range.collapse(true);
    });
    return true;
  }
  return false;
};
