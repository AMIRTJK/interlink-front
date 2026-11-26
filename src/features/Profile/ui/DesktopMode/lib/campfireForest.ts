import { createSeededRandom } from "./createSeededRandom";

type TRandom = () => number;

export interface IForestRow {
  base: number;
  waviness: number;
  treeHeight: [number, number];
  color: string;
  seed: number;
}

const HILL_STEP = 8;

const createHill = (base: number, waviness: number, random: TRandom) => {
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;
  return (x: number) =>
    base + Math.sin(x * 0.0035 + phaseA) * waviness + Math.sin(x * 0.011 + phaseB) * waviness * 0.4;
};

const fillUnderCurve = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  curve: (x: number) => number,
) => {
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + HILL_STEP; x += HILL_STEP) ctx.lineTo(x, curve(x));
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
};

// Ель — ярусы веток с опущенными кончиками: внешняя точка яруса ниже внутренней,
// поэтому силуэт читается как хвоя, а не как стопка треугольников.
const drawPine = (ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, random: TRandom) => {
  const tiers = 6 + Math.floor(random() * 3);
  const halfWidth = h * (0.18 + random() * 0.07);
  const trunkHalf = Math.max(1, h * 0.022);
  const top = baseY - h;
  // Нижние ветки опускаются почти до земли — без голых стволов «частоколом».
  const crownBottom = baseY - h * 0.02;
  const droop = h * 0.028;
  const right: Array<[number, number]> = [];
  const left: Array<[number, number]> = [];

  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = top + (crownBottom - top) * t;
    const reach = halfWidth * Math.pow(t, 0.85);
    const reachRight = reach * (0.8 + random() * 0.4);
    const reachLeft = reach * (0.8 + random() * 0.4);
    right.push([x + reachRight, y + droop]);
    left.push([x - reachLeft, y + droop]);
    if (i < tiers) {
      right.push([x + reachRight * 0.38, y - h * 0.01]);
      left.push([x - reachLeft * 0.38, y - h * 0.01]);
    }
  }

  ctx.beginPath();
  ctx.moveTo(x, top);
  right.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(x + trunkHalf, crownBottom + droop);
  ctx.lineTo(x + trunkHalf, baseY + 4);
  ctx.lineTo(x - trunkHalf, baseY + 4);
  ctx.lineTo(x - trunkHalf, crownBottom + droop);
  for (let i = left.length - 1; i >= 0; i--) ctx.lineTo(left[i][0], left[i][1]);
  ctx.closePath();
  ctx.fill();
};

export const drawForestRow = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  row: IForestRow,
  treeScale: number,
): ((x: number) => number) => {
  const random = createSeededRandom(row.seed);
  const hill = createHill(row.base, row.waviness, random);
  ctx.fillStyle = row.color;
  fillUnderCurve(ctx, width, height, hill);

  const [minH, maxH] = row.treeHeight;
  let x = -30;
  while (x < width + 30) {
    const treeH = (minH + Math.pow(random(), 1.4) * (maxH - minH)) * treeScale;
    drawPine(ctx, x, hill(x), treeH, random);
    // Редкие прогалины, чтобы опушка не выглядела гребёнкой.
    const gap = random() < 0.07 ? 50 + random() * 70 : 0;
    x += (8 + random() * 26 + gap) * treeScale;
  }
  return hill;
};

export const drawMountains = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  base: number,
  peak: number,
  color: string,
) => {
  const random = createSeededRandom(3);
  const [a, b, c] = [random(), random(), random()].map((value) => value * Math.PI * 2);
  const ridge = (x: number) => {
    const wave = Math.sin(x * 0.0021 + a) * 0.55 + Math.sin(x * 0.0057 + b) * 0.3 + Math.sin(x * 0.014 + c) * 0.15;
    return base - peak * (0.5 + wave * 0.5);
  };
  ctx.fillStyle = color;
  fillUnderCurve(ctx, width, height, ridge);
};

// Полоса тумана у подножия слоя: дальние планы растворяются в воздухе.
export const drawMist = (ctx: CanvasRenderingContext2D, width: number, y: number, depth: number, color: string) => {
  const mist = ctx.createLinearGradient(0, y - depth, 0, y + depth * 0.4);
  mist.addColorStop(0, "rgba(0, 0, 0, 0)");
  mist.addColorStop(0.75, color);
  mist.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, y - depth, width, depth * 1.4);
};

// Поляна начинается ровно по линии подножия ближнего ряда леса (edge), поэтому
// между деревьями и землёй нет ни полосы, ни ступеньки.
export const drawGround = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  edge: (x: number) => number,
  colors: readonly [string, string],
  sheen: string,
) => {
  const top = edge(width / 2);
  const depth = height - top;
  const ground = ctx.createLinearGradient(0, top, 0, height);
  ground.addColorStop(0, colors[0]);
  ground.addColorStop(1, colors[1]);
  ctx.fillStyle = ground;
  fillUnderCurve(ctx, width, height, edge);

  // Мягкие пятна светлее и темнее — неровная лесная поляна, а не ровная заливка.
  const random = createSeededRandom(41);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + HILL_STEP; x += HILL_STEP) ctx.lineTo(x, edge(x));
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 12; i++) {
    const nearness = random();
    const cx = random() * width;
    const cy = top + depth * (0.08 + nearness * 0.85);
    const rx = width * (0.07 + random() * 0.14) * (0.6 + nearness);
    const isLight = random() < 0.45;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.16 + nearness * 0.08);
    const patch = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    patch.addColorStop(0, isLight ? sheen : "rgba(0, 0, 0, 0.22)");
    patch.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = patch;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }
  ctx.restore();
};

// Крупные тёмные ели у краёв экрана, ближе всех к зрителю, — рамка, которая
// даёт сцене глубину и собирает взгляд к огню в центре.
export const drawFrameTrees = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
  const random = createSeededRandom(97);
  const size = Math.min(height * 0.62, width * 0.45);
  const trees = [
    { x: width * 0.01, h: size },
    { x: width * 0.07, h: size * 0.74 },
    { x: width * 0.99, h: size * 0.92 },
    { x: width * 0.935, h: size * 0.66 },
  ];
  ctx.fillStyle = color;
  trees.forEach((tree) => drawPine(ctx, tree.x, height + 10, tree.h, random));
};
