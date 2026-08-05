import { useMemo } from "react";

import { buildAuthorOrder, buildWordAuthorship } from "./buildAuthorship";
import { markAuthorship, type IAuthorshipFragment } from "./markAuthorship";
import type { IAuthorshipVersion } from "./model";

export interface IAuthorshipLegendItem {
  id: string;
  name: string;
  colorIndex: number;
}

const EMPTY_MARKED = { html: "", fragments: [] as IAuthorshipFragment[] };

/**
 * Подсветка авторства для правого холста режима истории версий.
 *
 * Размечает тело выбранной версии: кто написал каждое её слово. Историю
 * обрезаем по выбранной версии — авторство считается по тем правкам, которые к
 * этому моменту уже были, а более поздние на неё не влияют. По умолчанию
 * выбрана последняя версия, то есть показывается авторство актуального текста.
 *
 * Разбор версий стоит дорого, поэтому вся работа — в useMemo и только при
 * включённом режиме.
 *
 * Состояние наведения тут намеренно не живёт: оно меняется на каждое движение
 * мыши и перерисовывало бы весь экран редактора. Им владеет
 * AuthorshipHoverLayer.
 */
export const useAuthorship = (
  versions: IAuthorshipVersion[],
  enabled: boolean,
  targetVersionId?: string | number | null,
) => {
  const ordered = useMemo(() => {
    if (!enabled) return [];

    const sorted = [...versions].sort((a, b) => a.versionNumber - b.versionNumber);
    if (targetVersionId == null) return sorted;

    const index = sorted.findIndex(
      (version) => String(version.id) === String(targetVersionId),
    );
    return index === -1 ? sorted : sorted.slice(0, index + 1);
  }, [versions, enabled, targetVersionId]);

  const authorOrder = useMemo(() => buildAuthorOrder(ordered), [ordered]);

  const marked = useMemo(() => {
    const latest = ordered[ordered.length - 1];
    if (!latest?.content) return EMPTY_MARKED;

    const attribution = buildWordAuthorship(ordered);
    return markAuthorship(latest.content, attribution, authorOrder);
  }, [ordered, authorOrder]);

  const legend = useMemo<IAuthorshipLegendItem[]>(() => {
    const seen = new Map<string, IAuthorshipLegendItem>();
    ordered.forEach((version) => {
      if (seen.has(version.author.id)) return;
      seen.set(version.author.id, {
        id: version.author.id,
        name: version.author.name,
        colorIndex: authorOrder.get(version.author.id) ?? 0,
      });
    });
    return [...seen.values()];
  }, [ordered, authorOrder]);

  return {
    markedHtml: marked.html,
    fragments: marked.fragments,
    legend,
  };
};
