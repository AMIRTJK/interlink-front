import type { ITimelineEvent } from "./types";

export const COMPACT_CARDS_OPTIONS = [2, 3] as const;

export type TCompactCardsCount = (typeof COMPACT_CARDS_OPTIONS)[number];

export const COMPACT_STORAGE_KEY = "correspondence_structure_compact";

export const DEFAULT_CARDS_COUNT: TCompactCardsCount = 2;

/** Маркер строки этапа: по нему замеряется реальная высота этапа на экране. */
export const TIMELINE_ROW_ATTR = "data-timeline-row";
export const TIMELINE_ROW_MARKER = { [TIMELINE_ROW_ATTR]: "" } as const;
export const TIMELINE_ROW_SELECTOR = `[${TIMELINE_ROW_ATTR}]`;

/** Границы подбора: меньше двух этапов на карточку смысла не имеет,
 *  больше четырнадцати — карточка перестаёт помещаться на любом мониторе. */
export const MIN_ITEMS_PER_CARD = 2;
export const MAX_ITEMS_PER_CARD = 14;
export const DEFAULT_ITEMS_PER_CARD = 5;

export interface ICompactStructureSettings {
  enabled: boolean;
  cards: TCompactCardsCount;
}

export const DEFAULT_COMPACT_SETTINGS: ICompactStructureSettings = {
  enabled: false,
  cards: DEFAULT_CARDS_COUNT,
};

export interface ICompactTimelineCard {
  /** Порядковый номер (с единицы) первого этапа карточки во всём таймлайне. */
  startIndex: number;
  items: ITimelineEvent[];
}

export interface ICompactTimelinePage {
  cards: ICompactTimelineCard[];
  totalPages: number;
  pageIndex: number;
  /** Порядковый номер (с нуля) первого этапа страницы во всём таймлайне. */
  offset: number;
  /** Номера первого и последнего этапа страницы, с единицы. */
  from: number;
  to: number;
}

export const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const normalizeCardsCount = (value: unknown): TCompactCardsCount =>
  COMPACT_CARDS_OPTIONS.includes(value as TCompactCardsCount)
    ? (value as TCompactCardsCount)
    : DEFAULT_CARDS_COUNT;

/** Высота строки этапа по умолчанию — пока замер со страницы недоступен. */
export const FALLBACK_ROW_HEIGHT = 62;

/**
 * Последовательно раскладывает высоты по карточкам так, чтобы ни одна карточка
 * не превысила лимит. Возвращает индексы строк по карточкам либо null,
 * если в отведённое количество карточек всё не поместилось.
 */
const packByLimit = (heights: number[], cardsCount: number, limit: number): number[][] | null => {
  const groups: number[][] = [];
  let current: number[] = [];
  let currentHeight = 0;

  for (let index = 0; index < heights.length; index += 1) {
    if (current.length && currentHeight + heights[index] > limit) {
      groups.push(current);
      if (groups.length === cardsCount) return null;
      current = [];
      currentHeight = 0;
    }
    current.push(index);
    currentHeight += heights[index];
  }
  if (current.length) groups.push(current);

  return groups.length <= cardsCount ? groups : null;
};

const groupHeight = (group: number[], heights: number[]): number =>
  group.reduce((sum, index) => sum + heights[index], 0);

/** Делит самую высокую карточку пополам, пока не наберётся нужное число карточек. */
const spreadToAllCards = (groups: number[][], heights: number[], cardsCount: number): number[][] => {
  const result = [...groups];

  while (result.length < cardsCount) {
    let targetIndex = -1;
    let targetHeight = -1;
    result.forEach((group, index) => {
      const height = groupHeight(group, heights);
      if (group.length > 1 && height > targetHeight) {
        targetIndex = index;
        targetHeight = height;
      }
    });
    if (targetIndex === -1) break;

    const target = result[targetIndex];
    const half = targetHeight / 2;
    let splitAt = 1;
    let accumulated = heights[target[0]];
    while (splitAt < target.length - 1 && accumulated + heights[target[splitAt]] <= half) {
      accumulated += heights[target[splitAt]];
      splitAt += 1;
    }
    result.splice(targetIndex, 1, target.slice(0, splitAt), target.slice(splitAt));
  }

  return result;
};

/**
 * Разносит строки по карточкам так, чтобы самая высокая карточка была как можно
 * ниже: порядок строк сохраняется, минимальный лимит высоты ищется двоичным
 * поиском. Благодаря этому карточки получаются соразмерными, даже когда этапы
 * сильно отличаются по высоте (длинный комментарий, перенос имени и т. п.).
 */
export const balanceCardsByHeight = (heights: number[], cardsCount: number): number[][] => {
  if (!heights.length) return [];

  let low = Math.max(...heights);
  let high = heights.reduce((sum, height) => sum + height, 0);
  let best: number[][] = [heights.map((_, index) => index)];

  while (low <= high) {
    const limit = Math.floor((low + high) / 2);
    const packed = packByLimit(heights, cardsCount, limit);
    if (packed) {
      best = packed;
      high = limit - 1;
    } else {
      low = limit + 1;
    }
  }

  return spreadToAllCards(best, heights, cardsCount);
};

/** Границы страницы: сколько всего страниц и с какого этапа начинается текущая. */
export const getPageBounds = (
  eventsCount: number,
  cardsCount: TCompactCardsCount,
  itemsPerCard: number,
  page: number,
) => {
  const perPage = Math.max(1, cardsCount * Math.max(1, itemsPerCard));
  const totalPages = Math.max(1, Math.ceil(eventsCount / perPage));
  const pageIndex = clampNumber(page, 0, totalPages - 1);

  return { perPage, totalPages, pageIndex, offset: pageIndex * perPage };
};

/**
 * Раскладывает этапы таймлайна по карточкам одной страницы, сохраняя исходный
 * порядок: карточки заполняются последовательно, без пропусков и дублей.
 * Внутри страницы этапы распределяются по фактической высоте строк (`heights`,
 * ключ — порядковый номер этапа с нуля), поэтому карточки выходят соразмерными.
 */
export const splitEventsIntoCards = (
  events: ITimelineEvent[],
  cardsCount: TCompactCardsCount,
  itemsPerCard: number,
  page: number,
  heights?: Record<number, number>,
): ICompactTimelinePage => {
  const { perPage, totalPages, pageIndex, offset } = getPageBounds(
    events.length,
    cardsCount,
    itemsPerCard,
    page,
  );
  const pageEvents = events.slice(offset, offset + perPage);

  const pageHeights = pageEvents.map(
    (_, index) => heights?.[offset + index] || FALLBACK_ROW_HEIGHT,
  );

  const cards: ICompactTimelineCard[] = balanceCardsByHeight(pageHeights, cardsCount).map(
    (group) => ({
      startIndex: offset + group[0] + 1,
      items: group.map((index) => pageEvents[index]),
    }),
  );

  return {
    cards,
    totalPages,
    pageIndex,
    offset,
    from: pageEvents.length ? offset + 1 : 0,
    to: offset + pageEvents.length,
  };
};
