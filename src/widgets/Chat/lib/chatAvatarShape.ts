import type { Contact } from "../model";

/**
 * Форма аватарки групповой беседы говорит о числе участников: у фигуры столько
 * сторон, сколько людей в группе. Двое — базовый круг, с трёх до девяти —
 * правильный многоугольник, с десяти стороны уже неразличимы, поэтому вместо
 * них знак бесконечности.
 */
const MIN_POLYGON_MEMBERS = 3;
const MAX_POLYGON_MEMBERS = 9;

/** Точек на дугу: при 24 прогиб сегмента меньше пикселя даже на аватарке 80px. */
const ARC_POINTS = 24;
const FULL_TURN = Math.PI * 2;

/* Знак бесконечности — две петли-кольца, пересекающиеся в центре. Узнаваемым
   его делают именно дырки: сплошной силуэт читается как бабочка. Радиусы и
   разнос подобраны так, чтобы фигура занимала всю ширину бокса, держала
   привычную пропорцию около 2:1 и имела сплошную перемычку на пересечении. */
const INFINITY_OUTER_RADIUS = 0.28;
const INFINITY_HOLE_RADIUS = 0.17;
const INFINITY_LOOP_SHIFT = 0.22;
/**
 * Угол разреза кольца. Разрез — технический: контур обязан быть замкнутым и
 * односвязным, поэтому внешняя окружность, дырка и переходы между петлями
 * проходятся по одному отрезку дважды в обе стороны и в заливку не попадают.
 * 160° уводят его в зону перекрытия петель, где фигура сплошная, — так шов не
 * пересекает дырку и не может проявиться полоской.
 */
const INFINITY_SEAM_ANGLE = (160 * Math.PI) / 180;

const RIGHT_LOOP: [number, number] = [0.5 + INFINITY_LOOP_SHIFT, 0.5];
const LEFT_LOOP: [number, number] = [0.5 - INFINITY_LOOP_SHIFT, 0.5];

const toPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const buildClipPath = (points: [number, number][]) =>
  `polygon(${points
    .map(([x, y]) => `${toPercent(x)} ${toPercent(y)}`)
    .join(", ")})`;

const pointOn = (
  [cx, cy]: [number, number],
  radius: number,
  angle: number,
): [number, number] => [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];

const pushArc = (
  points: [number, number][],
  center: [number, number],
  radius: number,
  fromAngle: number,
  sweep: number,
) => {
  for (let i = 0; i <= ARC_POINTS; i += 1) {
    points.push(pointOn(center, radius, fromAngle + (sweep * i) / ARC_POINTS));
  }
};

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
 * Петля-кольцо: внешняя окружность в одну сторону, дырка — в обратную. По
 * правилу nonzero встречные обходы гасят друг друга, и середина петли остаётся
 * пустой, а перекрытие двух петель — наоборот, сплошным.
 */
const pushLoop = (
  points: [number, number][],
  center: [number, number],
  seamAngle: number,
) => {
  pushArc(points, center, INFINITY_OUTER_RADIUS, seamAngle, FULL_TURN);
  pushArc(points, center, INFINITY_HOLE_RADIUS, seamAngle, -FULL_TURN);
  points.push(pointOn(center, INFINITY_OUTER_RADIUS, seamAngle));
};

const buildInfinity = () => {
  const points: [number, number][] = [];

  pushLoop(points, RIGHT_LOOP, INFINITY_SEAM_ANGLE);
  pushLoop(points, LEFT_LOOP, Math.PI - INFINITY_SEAM_ANGLE);

  return buildClipPath(points);
};

/** Сплошной силуэт бесконечности — объединение внешних окружностей петель. */
const buildInfinityOutline = () => {
  const half = Math.sqrt(
    INFINITY_OUTER_RADIUS ** 2 - INFINITY_LOOP_SHIFT ** 2,
  );
  // Угол точки, где петли пересекаются: дуга между ±cross лежит внутри соседней
  // петли и в силуэт не входит.
  const cross = Math.atan2(half, -INFINITY_LOOP_SHIFT);
  const points: [number, number][] = [];

  pushArc(points, RIGHT_LOOP, INFINITY_OUTER_RADIUS, -cross, 2 * cross);
  pushArc(points, LEFT_LOOP, INFINITY_OUTER_RADIUS, Math.PI - cross, 2 * cross);

  return buildClipPath(points);
};

/** Набор фигур конечный и не зависит от данных — считаем один раз на модуль. */
const POLYGON_CLIP_PATHS = new Map<number, string>();

for (let sides = MIN_POLYGON_MEMBERS; sides <= MAX_POLYGON_MEMBERS; sides += 1) {
  POLYGON_CLIP_PATHS.set(sides, buildPolygon(sides));
}

const INFINITY_CLIP_PATH = buildInfinity();
const INFINITY_OUTLINE_CLIP_PATH = buildInfinityOutline();

/** Имена CSS-переменных с формой — их читают правила `.chat-avatar--shaped`. */
export const CHAT_AVATAR_CLIP_VAR = "--chat-avatar-clip";
export const CHAT_AVATAR_OUTLINE_CLIP_VAR = "--chat-avatar-clip-outline";

const getGroupMembers = ({ isGroup, membersCount }: Contact) =>
  isGroup ? (membersCount ?? 0) : 0;

/**
 * `clip-path` аватарки беседы либо `undefined`, если форма обычная — круглая
 * (личная переписка, группа из двух человек, группа без данных о составе).
 */
export const getChatAvatarClipPath = (contact: Contact): string | undefined => {
  const members = getGroupMembers(contact);
  if (members < MIN_POLYGON_MEMBERS) return undefined;
  if (members > MAX_POLYGON_MEMBERS) return INFINITY_CLIP_PATH;

  return POLYGON_CLIP_PATHS.get(members);
};

/**
 * Форма слоёв под аватаркой — контура, ореола и подложки наведения. У
 * многоугольника она совпадает с формой самой аватарки, а у бесконечности нет:
 * увеличенная копия фигуры с дырками дала бы рваную кайму, поэтому снизу лежит
 * её сплошной силуэт.
 */
export const getChatAvatarOutlineClipPath = (
  contact: Contact,
): string | undefined =>
  getGroupMembers(contact) > MAX_POLYGON_MEMBERS
    ? INFINITY_OUTLINE_CLIP_PATH
    : undefined;
