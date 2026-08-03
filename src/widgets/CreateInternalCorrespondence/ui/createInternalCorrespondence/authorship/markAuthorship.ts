import { collectTextNodes, isWhitespace, splitWords } from "./wordDiff";
import {
  AUTHORSHIP_ATTR,
  authorshipColorOf,
  type IAuthorshipEntry,
  type IWordAuthorship,
} from "./model";

/** Фрагмент подсветки: то, что показываем в карточке при наведении. */
export interface IAuthorshipFragment {
  current: IAuthorshipEntry;
  history: IAuthorshipEntry[];
  colorIndex: number;
}

export interface IMarkAuthorshipResult {
  html: string;
  fragments: IAuthorshipFragment[];
}

const fragmentKey = (word: IWordAuthorship) =>
  [
    word.current.authorId,
    word.current.versionId,
    ...word.history.map((entry) => `${entry.authorId}:${entry.versionId}`),
  ].join("|");

/**
 * Оборачивает слова в <mark> с цветом автора и ссылкой на фрагмент.
 *
 * Обход текстовых узлов тот же, что в extractWordTokens, поэтому N-е слово
 * здесь — это N-й элемент массива авторства. Слова без авторства (массивы
 * разошлись) просто остаются без подсветки: лучше не показать часть разметки,
 * чем приписать текст чужому человеку.
 */
export const markAuthorship = (
  html: string,
  attribution: IWordAuthorship[],
  authorOrder: Map<string, number>,
): IMarkAuthorshipResult => {
  if (typeof document === "undefined" || !html || !attribution.length) {
    return { html: html || "", fragments: [] };
  }

  const root = document.createElement("div");
  root.innerHTML = html;

  const fragments: IAuthorshipFragment[] = [];
  const indexByKey = new Map<string, number>();
  let wordIndex = 0;

  const fragmentIndexFor = (word: IWordAuthorship) => {
    const key = fragmentKey(word);
    const existing = indexByKey.get(key);
    if (existing !== undefined) return existing;

    const index = fragments.length;
    fragments.push({
      current: word.current,
      history: word.history,
      colorIndex: authorOrder.get(word.current.authorId) ?? 0,
    });
    indexByKey.set(key, index);
    return index;
  };

  collectTextNodes(root).forEach((node) => {
    const parts = splitWords(node.data);
    if (!parts.some((part) => !isWhitespace(part))) return;

    const output = document.createDocumentFragment();
    let buffer: string[] = [];
    let bufferIndex: number | null = null;
    let pendingSpace = "";

    const flush = () => {
      if (!buffer.length) return;
      const text = buffer.join("");
      const index = bufferIndex;
      buffer = [];

      if (index === null) {
        output.appendChild(document.createTextNode(text));
        return;
      }

      const mark = document.createElement("mark");
      mark.setAttribute(AUTHORSHIP_ATTR, String(index));
      mark.style.backgroundColor = authorshipColorOf(
        fragments[index].colorIndex,
      ).mark;
      mark.style.color = "inherit";
      mark.style.borderRadius = "2px";
      mark.textContent = text;
      output.appendChild(mark);
    };

    parts.forEach((part) => {
      if (isWhitespace(part)) {
        pendingSpace += part;
        return;
      }

      const word = attribution[wordIndex];
      wordIndex += 1;
      const index = word ? fragmentIndexFor(word) : null;

      if (index === bufferIndex) {
        // Пробел внутри прогона одного автора оставляем под подсветкой, чтобы
        // фраза не распадалась на отдельные подкрашенные слова.
        if (pendingSpace) buffer.push(pendingSpace);
      } else {
        flush();
        if (pendingSpace) output.appendChild(document.createTextNode(pendingSpace));
        bufferIndex = index;
      }

      pendingSpace = "";
      buffer.push(part);
    });

    flush();
    if (pendingSpace) output.appendChild(document.createTextNode(pendingSpace));

    node.replaceWith(output);
  });

  return { html: root.innerHTML, fragments };
};
