import { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  clampNumber,
  normalizeCardsCount,
  COMPACT_STORAGE_KEY,
  DEFAULT_COMPACT_SETTINGS,
  DEFAULT_ITEMS_PER_CARD,
  FALLBACK_ROW_HEIGHT,
  ICompactStructureSettings,
  MAX_ITEMS_PER_CARD,
  MIN_ITEMS_PER_CARD,
  TCompactCardsCount,
  TIMELINE_ROW_SELECTOR,
} from "./compact";

const ROW_GAP = 12;
/** Заголовок и внутренние отступы карточки — не занимаются этапами. */
const CARD_CHROME_HEIGHT = 52;
const VIEWPORT_BOTTOM_GAP = 24;

// Режим отображения — общая настройка интерфейса, а не состояние одного письма:
// открытые карточки должны переключаться синхронно, поэтому значение живёт
// в модульном кэше с подпиской, а не в состоянии каждого компонента.
let settingsCache: ICompactStructureSettings | null = null;
const listeners = new Set<(settings: ICompactStructureSettings) => void>();

const readSettings = (): ICompactStructureSettings => {
  if (settingsCache) return settingsCache;
  try {
    const raw = localStorage.getItem(COMPACT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    settingsCache = parsed
      ? { enabled: Boolean(parsed.enabled), cards: normalizeCardsCount(parsed.cards) }
      : DEFAULT_COMPACT_SETTINGS;
  } catch {
    settingsCache = DEFAULT_COMPACT_SETTINGS;
  }
  return settingsCache;
};

const writeSettings = (patch: Partial<ICompactStructureSettings>) => {
  const next: ICompactStructureSettings = { ...readSettings(), ...patch };
  settingsCache = next;
  try {
    localStorage.setItem(COMPACT_STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error(err);
  }
  listeners.forEach((listener) => listener(next));
};

export const useCompactStructureSettings = () => {
  const [settings, setSettings] = useState<ICompactStructureSettings>(readSettings);

  useEffect(() => {
    listeners.add(setSettings);
    return () => {
      listeners.delete(setSettings);
    };
  }, []);

  const setCompact = useCallback((enabled: boolean) => writeSettings({ enabled }), []);
  const setCardsCount = useCallback(
    (cards: TCompactCardsCount) => writeSettings({ cards }),
    [],
  );

  return {
    isCompact: settings.enabled,
    cardsCount: settings.cards,
    setCompact,
    setCardsCount,
  };
};

interface IUseCardCapacityArgs {
  /** Контейнер карточек — от его верхней кромки считается свободная высота. */
  boardRef: RefObject<HTMLDivElement | null>;
  /** Блок под карточками (пагинация и связанные документы) — он тоже должен поместиться. */
  footerRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  /** Смена ключа сбрасывает историю подгонки: раскладка изменилась принципиально. */
  resetKey: string | number;
}

/**
 * Подбирает количество этапов на карточку так, чтобы блок структуры вместе со
 * связанными документами укладывался в видимую область окна без прокрутки.
 * Высота этапа берётся замером уже отрисованных строк, поэтому после первой
 * отрисовки значение уточняется; история применённых значений защищает от
 * зацикливания «увеличили — не влезло — уменьшили».
 */
export const useTimelineCardCapacity = ({
  boardRef,
  footerRef,
  isActive,
  resetKey,
}: IUseCardCapacityArgs): number => {
  const [itemsPerCard, setItemsPerCard] = useState<number>(DEFAULT_ITEMS_PER_CARD);
  const appliedRef = useRef<number>(DEFAULT_ITEMS_PER_CARD);
  const historyRef = useRef<number[]>([]);

  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!isActive || !board) return;

    const boardTop = board.getBoundingClientRect().top;
    const footerHeight = footerRef.current?.offsetHeight ?? 0;
    const available =
      window.innerHeight - boardTop - footerHeight - VIEWPORT_BOTTOM_GAP - CARD_CHROME_HEIGHT;

    const rows = Array.from(
      board.querySelectorAll<HTMLElement>(TIMELINE_ROW_SELECTOR),
    );
    const rowHeight = rows.length
      ? rows.reduce((sum, row) => sum + row.offsetHeight, 0) / rows.length + ROW_GAP
      : FALLBACK_ROW_HEIGHT + ROW_GAP;

    const next = clampNumber(
      Math.floor(available / rowHeight),
      MIN_ITEMS_PER_CARD,
      MAX_ITEMS_PER_CARD,
    );

    if (next === appliedRef.current) return;
    if (historyRef.current.includes(next)) return;

    historyRef.current = [...historyRef.current, next].slice(-4);
    appliedRef.current = next;
    setItemsPerCard(next);
  }, [boardRef, footerRef, isActive]);

  useLayoutEffect(() => {
    historyRef.current = [];
  }, [resetKey, isActive]);

  useLayoutEffect(() => {
    measure();
  }, [measure, resetKey, itemsPerCard]);

  useEffect(() => {
    if (!isActive) return;

    let frame = 0;
    const handleResize = () => {
      historyRef.current = [];
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
  }, [isActive, measure]);

  return itemsPerCard;
};

interface IUseRowHeightsArgs {
  boardRef: RefObject<HTMLDivElement | null>;
  /** Номер первого этапа страницы: замеры хранятся по сквозным номерам этапов. */
  offset: number;
  isActive: boolean;
}

/**
 * Замеряет фактическую высоту отрисованных этапов. Строки в DOM идут в том же
 * порядке, что и на странице, поэтому замер сопоставляется с этапом по позиции.
 * Значения нужны раскладке, чтобы карточки получались соразмерными по высоте.
 */
export const useTimelineRowHeights = ({
  boardRef,
  offset,
  isActive,
}: IUseRowHeightsArgs): Record<number, number> => {
  const [heights, setHeights] = useState<Record<number, number>>({});

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!isActive || !board) return;

    const rows = Array.from(board.querySelectorAll<HTMLElement>(TIMELINE_ROW_SELECTOR));
    if (!rows.length) return;

    let hasChanges = false;
    const next = { ...heights };
    rows.forEach((row, index) => {
      const key = offset + index;
      const height = Math.round(row.offsetHeight) + ROW_GAP;
      if (Math.abs((next[key] ?? 0) - height) > 2) {
        next[key] = height;
        hasChanges = true;
      }
    });

    if (hasChanges) setHeights(next);
  });

  return heights;
};
