import { diffWords, extractWordTokens } from "./wordDiff";
import {
  MAX_AUTHORSHIP_HISTORY,
  type IAuthorshipEntry,
  type IAuthorshipVersion,
  type IWordAuthorship,
} from "./model";

const entryOf = (version: IAuthorshipVersion): IAuthorshipEntry => ({
  authorId: version.author.id,
  authorName: version.author.name,
  authorPosition: version.author.position,
  versionId: version.id,
  versionNumber: version.versionNumber,
  date: version.date,
});

const entryKey = (entry: IAuthorshipEntry) =>
  `${entry.authorId}:${entry.versionId}`;

/**
 * История места в тексте: вклады, которые вытеснила текущая правка. Собираем из
 * авторства удалённых слов и их собственных историй, схлопывая повторы.
 */
const buildHistory = (replaced: IWordAuthorship[]): IAuthorshipEntry[] => {
  const seen = new Set<string>();
  const history: IAuthorshipEntry[] = [];

  const add = (entry: IAuthorshipEntry) => {
    const key = entryKey(entry);
    if (seen.has(key) || history.length >= MAX_AUTHORSHIP_HISTORY) return;
    seen.add(key);
    history.push(entry);
  };

  replaced.forEach((word) => {
    add(word.current);
    word.history.forEach(add);
  });

  return history;
};

/**
 * Авторство каждого слова последней версии.
 *
 * Идём по цепочке версий: слова, пережившие правку, сохраняют прежнего автора,
 * новые получают автора той версии, в которой появились. Если правка заменила
 * один фрагмент другим, вытесненные авторы уходят в history — из неё строится
 * «этот кусок раньше писал такой-то».
 *
 * versions ожидаются по возрастанию номера версии.
 */
export const buildWordAuthorship = (
  versions: IAuthorshipVersion[],
): IWordAuthorship[] => {
  if (!versions.length) return [];

  const firstEntry = entryOf(versions[0]);
  let tokens = extractWordTokens(versions[0].content);
  let attribution: IWordAuthorship[] = tokens.map(() => ({
    current: firstEntry,
    history: [],
  }));

  for (let index = 1; index < versions.length; index += 1) {
    const version = versions[index];
    const nextTokens = extractWordTokens(version.content);
    const entry = entryOf(version);
    const ops = diffWords(tokens, nextTokens);

    const next: IWordAuthorship[] = [];
    let cursor = 0;
    let replaced: IWordAuthorship[] = [];

    ops.forEach((op) => {
      if (op.type === "equal") {
        for (let i = 0; i < op.count; i += 1) {
          next.push(attribution[cursor + i] ?? { current: entry, history: [] });
        }
        cursor += op.count;
        // Удаление, за которым идёт не вставка, а совпадение, — это просто
        // вычеркнутый текст: заменять нечего, историю не наследуем.
        replaced = [];
        return;
      }

      if (op.type === "delete") {
        replaced = attribution.slice(cursor, cursor + op.count);
        cursor += op.count;
        return;
      }

      const history = buildHistory(replaced);
      for (let i = 0; i < op.count; i += 1) next.push({ current: entry, history });
      replaced = [];
    });

    attribution = next;
    tokens = nextTokens;
  }

  return attribution;
};

/**
 * Порядковые номера авторов документа — по первому появлению в истории версий.
 * От номера зависит цвет подсветки, поэтому он должен быть стабилен.
 */
export const buildAuthorOrder = (versions: IAuthorshipVersion[]) => {
  const order = new Map<string, number>();
  versions.forEach((version) => {
    if (!order.has(version.author.id)) order.set(version.author.id, order.size);
  });
  return order;
};
