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
