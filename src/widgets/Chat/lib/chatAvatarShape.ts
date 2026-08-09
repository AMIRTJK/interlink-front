import type { Contact } from "../model";

/**
 * Форма аватарки групповой беседы говорит о числе участников: у фигуры столько
 * сторон, сколько людей в группе. Двое — базовый круг, с трёх до десяти —
 * правильный многоугольник, свыше десяти стороны уже неразличимы, поэтому
 * вместо них знак бесконечности.
 */
const MIN_SHAPE_MEMBERS = 3;
const MAX_SHAPE_MEMBERS = 10;

/** Точек в контуре бесконечности: меньше — заметны изломы, больше — лишняя длина строки. */
const INFINITY_POINTS = 72;
/** Высота знака бесконечности относительно ширины. */
const INFINITY_HEIGHT_RATIO = 0.5;

const toPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const buildClipPath = (points: [number, number][]) =>
  `polygon(${points
    .map(([x, y]) => `${toPercent(x)} ${toPercent(y)}`)
    .join(", ")})`;

/**
 * Правильный n-угольник, вписанный в бокс элемента и поставленный на плоское
 * основание: у чётных фигур горизонтальны верх и низ, у нечётных вершина сверху.
 */
const buildPolygon = (sides: number) => {
  const offset = sides % 2 === 0 ? Math.PI / sides : 0;
  const points: [number, number][] = [];

  for (let i = 0; i < sides; i += 1) {
    const angle = -Math.PI / 2 + offset + (i * 2 * Math.PI) / sides;
    points.push([0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)]);
  }

  return buildClipPath(points);
};

/**
 * Лемниската Жероно (x = cos t, y = sin t · cos t) — замкнутая «восьмёрка».
 * Кривая пересекает себя в центре, обе петли попадают под заливку и в
 * nonzero, и в evenodd, поэтому правило заполнения задавать не нужно.
 */
const buildInfinity = () => {
  const points: [number, number][] = [];

  for (let i = 0; i < INFINITY_POINTS; i += 1) {
    const t = (i * 2 * Math.PI) / INFINITY_POINTS;
    points.push([
      0.5 + 0.5 * Math.cos(t),
      0.5 + INFINITY_HEIGHT_RATIO * Math.sin(t) * Math.cos(t),
    ]);
  }

  return buildClipPath(points);
};

/** Набор фигур конечный и не зависит от данных — считаем один раз на модуль. */
const POLYGON_CLIP_PATHS = new Map<number, string>();

for (let sides = MIN_SHAPE_MEMBERS; sides <= MAX_SHAPE_MEMBERS; sides += 1) {
  POLYGON_CLIP_PATHS.set(sides, buildPolygon(sides));
}

const INFINITY_CLIP_PATH = buildInfinity();

/** Имя CSS-переменной с формой — её читают правила `.chat-avatar--shaped`. */
export const CHAT_AVATAR_CLIP_VAR = "--chat-avatar-clip";

/**
 * `clip-path` аватарки беседы либо `undefined`, если форма обычная — круглая
 * (личная переписка, группа из двух человек, группа без данных о составе).
 */
export const getChatAvatarClipPath = (contact: Contact): string | undefined => {
  if (!contact.isGroup) return undefined;

  const members = contact.membersCount ?? 0;
  if (members < MIN_SHAPE_MEMBERS) return undefined;
  if (members > MAX_SHAPE_MEMBERS) return INFINITY_CLIP_PATH;

  return POLYGON_CLIP_PATHS.get(members);
};
