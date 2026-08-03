import { AUTHORSHIP_SKIP_SELECTOR, MAX_DIFF_TOKENS } from "./model";

export type TDiffOp =
  | { type: "equal"; count: number }
  | { type: "insert"; count: number }
  | { type: "delete"; count: number };

/**
 * Слова документа в порядке чтения. Пробелы отбрасываем: они дают шумные диффы
 * (переносы строк и отступы меняются при любой правке разметки), а для
 * авторства значимы только сами слова.
 *
 * Тот же обход текстовых узлов использует разметка подсветки, поэтому индексы
 * слов здесь и там совпадают.
 */
export const collectTextNodes = (root: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(AUTHORSHIP_SKIP_SELECTOR)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
};

export const splitWords = (text: string): string[] =>
  text.split(/(\s+)/).filter((part) => part.length > 0);

export const isWhitespace = (part: string) => /^\s+$/.test(part);

export const extractWordTokens = (html: string | null | undefined): string[] => {
  if (typeof document === "undefined" || !html) return [];
  const root = document.createElement("div");
  root.innerHTML = html;

  const tokens: string[] = [];
  collectTextNodes(root).forEach((node) => {
    splitWords(node.data).forEach((part) => {
      if (!isWhitespace(part)) tokens.push(part);
    });
  });
  return tokens;
};

/**
 * Наибольшая общая подпоследовательность двух коротких списков слов.
 * Классическая O(n*m) таблица — вызывается только на «середине», оставшейся
 * после отсечения общего начала и конца.
 */
const lcsOps = (before: string[], after: string[]): TDiffOp[] => {
  const n = before.length;
  const m = after.length;

  const table: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i][j] =
        before[i] === after[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const ops: TDiffOp[] = [];
  const push = (type: TDiffOp["type"]) => {
    const last = ops[ops.length - 1];
    if (last && last.type === type) last.count += 1;
    else ops.push({ type, count: 1 } as TDiffOp);
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      push("equal");
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push("delete");
      i += 1;
    } else {
      push("insert");
      j += 1;
    }
  }
  while (i < n) {
    push("delete");
    i += 1;
  }
  while (j < m) {
    push("insert");
    j += 1;
  }

  return ops;
};

/**
 * Пословный дифф двух версий. Сначала отсекаем общее начало и конец — обычная
 * правка затрагивает малую часть документа, и LCS остаётся считать на десятках
 * слов вместо тысяч. Если середина всё равно слишком велика, честно отдаём её
 * как «всё заменено»: подсветка станет грубее, но интерфейс не подвиснет.
 */
export const diffWords = (before: string[], after: string[]): TDiffOp[] => {
  const ops: TDiffOp[] = [];

  let prefix = 0;
  const maxPrefix = Math.min(before.length, after.length);
  while (prefix < maxPrefix && before[prefix] === after[prefix]) prefix += 1;

  let suffix = 0;
  const maxSuffix = Math.min(before.length, after.length) - prefix;
  while (
    suffix < maxSuffix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const beforeMiddle = before.slice(prefix, before.length - suffix);
  const afterMiddle = after.slice(prefix, after.length - suffix);

  if (prefix > 0) ops.push({ type: "equal", count: prefix });

  const isTooLarge =
    beforeMiddle.length > MAX_DIFF_TOKENS || afterMiddle.length > MAX_DIFF_TOKENS;

  if (isTooLarge) {
    if (beforeMiddle.length) ops.push({ type: "delete", count: beforeMiddle.length });
    if (afterMiddle.length) ops.push({ type: "insert", count: afterMiddle.length });
  } else {
    ops.push(...lcsOps(beforeMiddle, afterMiddle));
  }

  if (suffix > 0) ops.push({ type: "equal", count: suffix });

  return ops;
};
