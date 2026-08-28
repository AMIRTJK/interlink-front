import type { CSSProperties } from "react";

// Палитра и размеры объёмного оформления. Значения перенесены из макетов
// `messenger-redesign`: там каждая кнопка красится своим цветом, а форма и тени
// у всех одинаковые — поэтому цвет здесь данные, а не разметка.

/** Тон объёмного элемента: имя цвета из набора токенов оформления. */
export type TReliefTone =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "amber"
  | "red"
  | "grey"
  | "mint"
  | "indigo";

/**
 * Инлайновый стиль, задающий тон объёмному элементу. Сам цвет живёт в токенах
 * оформления — сюда попадает только ссылка на нужный, поэтому тёмная тема
 * перекрашивает кнопки, не трогая разметку.
 */
export const toneStyle = (tone: TReliefTone): CSSProperties =>
  ({ "--chat-relief-btn-rgb": `var(--chat-relief-${tone})` }) as CSSProperties;

/** Ширина панели бесед в вертикальных макетах (макет: 396–501px), px. */
export const PANEL_WIDTH = 396;

/** Высота полосы бесед в горизонтальных макетах (макет: 180px), px. */
export const RAIL_HEIGHT = 180;

/** Ширина блока управления рядом с полосой бесед в горизонтальных макетах, px. */
export const RAIL_CONTROLS_WIDTH = 300;

/** Размер аватарки в списке бесед и в шапке беседы, px. */
export const AVATAR_SIZE = 44;

/** Размер аватарки в горизонтальной полосе бесед, px. */
export const RAIL_AVATAR_SIZE = 44;

/** Длительность отскока кнопки отправки — совпадает с анимацией в CSS, мс. */
export const SEND_BOUNCE_MS = 260;
