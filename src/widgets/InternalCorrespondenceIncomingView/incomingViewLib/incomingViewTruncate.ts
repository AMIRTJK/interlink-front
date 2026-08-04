const ATOMIC = new Set(["TABLE", "IMG", "FIGURE", "SVG", "VIDEO", "CANVAS"]);

// `\s` считает пробелами и неразрывные символы, а по ним перенос запрещён —
// вычитаем их по кодам.
const NON_BREAKING_SPACE_CODES = new Set([
  0x00a0, // неразрывный пробел
  0x2007, // цифровой пробел
  0x202f, // узкий неразрывный пробел
  0xfeff, // BOM
]);
const ZERO_WIDTH_SPACE = 0x200b;

/** Пробел, на котором браузер переносит строку. */
const isBreakingSpace = (ch: string | undefined): boolean => {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code === ZERO_WIDTH_SPACE) return true;
  return /\s/.test(ch) && !NON_BREAKING_SPACE_CODES.has(code);
};

// Символы, ПОСЛЕ которых перенос допустим. Неразрывный дефис U+2011 исключён.
const BREAKING_HYPHEN_CODES = new Set([
  0x002d, // дефис-минус
  0x00ad, // мягкий перенос
  0x2010, // дефис
  0x2012, // цифровое тире
  0x2013, // короткое тире
  0x2014, // длинное тире
]);

/** Символ, после которого допустим перенос: дефис или тире. */
const isBreakingHyphen = (ch: string | undefined): boolean =>
  !!ch && BREAKING_HYPHEN_CODES.has(ch.charCodeAt(0));

/**
 * Сдвигает точку разреза `max` назад до ближайшей границы слова, чтобы слово
 * не разрывалось между страницами: не влезло целиком — уезжает на следующий
 * лист целиком, как в Word.
 *
 * `from` — начало рассматриваемого куска (координаты общие с
 * `truncateToChars`/`dropChars`: считаются только символы текстовых узлов).
 * Возвращает -1, если границы нет — единственное слово шире доступного места,
 * и вызывающий сам решает, переносить блок целиком или всё же резать по буквам.
 */
export const wordBoundaryBefore = (
  text: string,
  max: number,
  from = 0
): number => {
  if (max >= text.length) return max;
  let fallback = -1;
  for (let k = max; k > from; k--) {
    const prev = text[k - 1];
    if (!isBreakingSpace(prev) && !isBreakingHyphen(prev)) continue;
    // Голова из одних пробелов бессмысленна: страница закончится пустой
    // строкой вместо текста. Левее будет только хуже — выходим.
    if (!text.slice(from, k).trim()) break;
    if (fallback < 0) fallback = k;
    // Хвост не должен начинаться с пробела: при `white-space: pre-wrap` он
    // виден отступом в начале следующей страницы.
    if (!isBreakingSpace(text[k])) return k;
  }
  return fallback;
};

// Элементы, которые переносят строку сами: их конец — такая же законная точка
// разреза страницы, как пробел между словами.
const LINE_BREAKING_BLOCKS = new Set([
  "P",
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "SECTION",
  "ARTICLE",
  "HR",
]);

/**
 * Ближайший СТРУКТУРНЫЙ перенос строки не дальше `max`: `<br>` либо конец
 * вложенного блока. В тексте таких переносов нет ни одного символа, поэтому
 * `wordBoundaryBefore` их не видит — а без них абзац из коротких «слов» без
 * пробелов (строки через Shift+Enter, вложенные абзацы после быстрой вставки)
 * не имеет ни одной границы слова и не делится вовсе: остаток листа остаётся
 * пустым, а блок целиком уезжает на следующую страницу.
 *
 * `from` — начало рассматриваемого куска, координаты общие с
 * `truncateToChars`/`dropChars`/`wordBoundaryBefore`: считаются только символы
 * текстовых узлов. Возвращает -1, если подходящей границы нет.
 */
export const structuralBreakBefore = (
  root: HTMLElement,
  text: string,
  max: number,
  from = 0
): number => {
  let acc = 0;
  let best = -1;

  const consider = (offset: number) => {
    if (offset <= from || offset > max) return;
    // Голова из одних пробелов бессмысленна — как и в wordBoundaryBefore.
    if (!text.slice(from, offset).trim()) return;
    if (offset > best) best = offset;
  };

  const visit = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (acc > max) return;
      if (child.nodeType === Node.TEXT_NODE) {
        acc += child.textContent?.length ?? 0;
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as Element;
      if (el.nodeName === "BR") {
        consider(acc);
        continue;
      }
      // Внутрь таблиц и картинок не заходим: они делятся по своим правилам
      // (по строкам), и точка разреза внутри них ничего хорошего не даст.
      if (ATOMIC.has(el.nodeName)) {
        acc += (el.textContent || "").length;
        continue;
      }
      visit(el);
      if (LINE_BREAKING_BLOCKS.has(el.nodeName)) consider(acc);
    }
  };

  visit(root);
  return best;
};

export const truncateToChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) {
      node.removeChild(c);
      continue;
    }
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) budget.left -= len;
      else {
        c.textContent = (c.textContent || "").slice(0, budget.left);
        budget.left = 0;
      }
    } else {
      truncateToChars(c, budget);
    }
  }
};

export const dropChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) return;
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) {
        budget.left -= len;
        (c as ChildNode).remove();
      } else {
        c.textContent = (c.textContent || "").slice(budget.left);
        budget.left = 0;
      }
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      const el = c as Element;
      const textLen = (el.textContent || "").length;
      if (textLen === 0) {
        el.remove();
        continue;
      }
      if (
        textLen <= budget.left &&
        !el.querySelector("br,img,svg,video,canvas")
      ) {
        budget.left -= textLen;
        el.remove();
      } else {
        dropChars(el, budget);
        if (
          !(el.textContent || "").length &&
          !el.querySelector("br,img,svg,video,canvas")
        ) {
          el.remove();
        }
      }
    } else {
      (c as ChildNode).remove();
    }
  }
};

export const brAtCharBoundary = (root: HTMLElement, k: number): boolean => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );
  let acc = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const len = n.textContent?.length ?? 0;
      if (acc + len > k) return false;
      acc += len;
    } else if ((n as Element).nodeName === "BR") {
      if (acc === k) return true;
    }
  }
  return false;
};

/**
 * Возвращает в голову `<br>`, стоявший ровно на границе разреза: сам
 * `truncateToChars` удаляет всё после исчерпания бюджета, включая этот `<br>`, а
 * `removeLeadingBr` убирает его же из начала хвоста. Без возврата перенос строки
 * исчезал из документа совсем — в редакторе куски склеиваются обратно при
 * каждой пагинации, и две строки навсегда становились одной. В конце блока
 * `<br>` невидим, поэтому высота головы не меняется.
 */
export const restoreBoundaryBr = (head: HTMLElement): void => {
  const walker = document.createTreeWalker(head, NodeFilter.SHOW_TEXT, null);
  let last: Node | null = null;
  let n: Node | null;
  while ((n = walker.nextNode())) last = n;
  if (!last || !last.parentNode) return;
  (last as ChildNode).after(document.createElement("br"));
};

export const removeLeadingBr = (root: HTMLElement): void => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      if ((n.textContent || "").length) return;
      continue;
    }
    const el = n as Element;
    if (el.nodeName === "BR") {
      el.remove();
      return;
    }
    if (ATOMIC.has(el.nodeName)) return;
  }
};
