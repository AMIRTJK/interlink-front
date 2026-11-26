import type { IFirePlace } from "./campfireScene";
import { createSeededRandom } from "./createSeededRandom";
import { renderCenteredLayer, type ICenteredLayer } from "./campfireLayer";

type TRandom = () => number;

const STONE_COUNT = 15;
const RING_RADIUS = { x: 50, y: 13 } as const;
const TEEPEE_BASE = { x: 28, y: 7 } as const;
// Вершина шалаша прячется в пламени — жерди не торчат над огнём палками.
const TEEPEE_HEIGHT = 32;
// Углы оснований поленьев шалаша на эллипсе кострища (0 — справа, π/2 — к зрителю).
const LOG_ANGLES = [3.7, 4.7, 5.7, 0.9, 2.2] as const;

interface IStone {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  shade: number;
  isFront: boolean;
}

interface ILog {
  baseX: number;
  baseY: number;
  isFront: boolean;
}

const tone = (rgb: readonly [number, number, number], shade: number) =>
  `rgb(${rgb.map((channel) => Math.round(channel * shade)).join(", ")})`;

// Камни стоят вокруг костра со случайными вариациями расстояния и формы
const createStones = ({ x, y, scale }: IFirePlace, random: TRandom): IStone[] =>
  Array.from({ length: STONE_COUNT }, (_, i) => {
    const angle = (i / STONE_COUNT) * Math.PI * 2 + (random() - 0.5) * 0.3;
    const rVar = 0.92 + random() * 0.16;
    return {
      x: x + Math.cos(angle) * RING_RADIUS.x * scale * rVar,
      y: y + 8 * scale + Math.sin(angle) * RING_RADIUS.y * scale * rVar,
      rx: (5 + random() * 3.5) * scale,
      ry: (3.2 + random() * 2.2) * scale,
      rotation: (random() - 0.5) * 0.6,
      shade: 0.75 + random() * 0.35,
      isFront: Math.sin(angle) > 0,
    };
  });

// Бок камня, обращённый к огню, тёплый, дальний — мягко уходит в темноту поляны.
const drawStone = (ctx: CanvasRenderingContext2D, stone: IStone, fireX: number, fireY: number) => {
  const towardFire = Math.atan2(fireY - stone.y, fireX - stone.x);
  const reach = Math.max(stone.rx, stone.ry);
  const shade = ctx.createLinearGradient(
    stone.x + Math.cos(towardFire) * reach,
    stone.y + Math.sin(towardFire) * reach,
    stone.x - Math.cos(towardFire) * reach,
    stone.y - Math.sin(towardFire) * reach,
  );
  shade.addColorStop(0, tone([175, 95, 48], stone.shade));
  shade.addColorStop(0.35, tone([54, 38, 32], stone.shade));
  shade.addColorStop(1, tone([16, 14, 18], stone.shade));
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(stone.x, stone.y, stone.rx, stone.ry, stone.rotation, 0, Math.PI * 2);
  ctx.fill();
};

const createLogs = ({ x, y, scale }: IFirePlace): ILog[] =>
  LOG_ANGLES.map((angle) => ({
    baseX: x + Math.cos(angle) * TEEPEE_BASE.x * scale,
    baseY: y + 6 * scale + Math.sin(angle) * TEEPEE_BASE.y * scale,
    isFront: Math.sin(angle) > 0,
  }));

// Полено шалаша — сужающаяся к вершине жердь: тёмная кора снаружи, тлеющий
// низ и обугленная верхушка там, где её лижет пламя.
const drawLog = (ctx: CanvasRenderingContext2D, log: ILog, apexX: number, apexY: number, scale: number) => {
  const dx = apexX - log.baseX;
  const dy = apexY - log.baseY;
  const length = Math.hypot(dx, dy);
  const normalX = -dy / length;
  const normalY = dx / length;
  const baseHalf = 4.6 * scale;
  const topHalf = 2.6 * scale;

  const bark = ctx.createLinearGradient(log.baseX, log.baseY, apexX, apexY);
  bark.addColorStop(0, "rgb(130, 50, 20)");
  bark.addColorStop(0.3, "rgb(64, 34, 20)");
  bark.addColorStop(0.75, "rgb(36, 20, 14)");
  bark.addColorStop(1, "rgb(70, 28, 12)");
  ctx.fillStyle = bark;
  ctx.beginPath();
  ctx.moveTo(log.baseX + normalX * baseHalf, log.baseY + normalY * baseHalf);
  ctx.lineTo(apexX + normalX * topHalf, apexY + normalY * topHalf);
  ctx.lineTo(apexX - normalX * topHalf, apexY - normalY * topHalf);
  ctx.lineTo(log.baseX - normalX * baseHalf, log.baseY - normalY * baseHalf);
  ctx.closePath();
  ctx.fill();

  // Тонкий блик по одной стороне — у полена появляется объём.
  ctx.strokeStyle = "rgba(255, 170, 100, 0.14)";
  ctx.lineWidth = Math.max(1, scale * 0.9);
  ctx.beginPath();
  ctx.moveTo(log.baseX + normalX * baseHalf * 0.6, log.baseY + normalY * baseHalf * 0.6);
  ctx.lineTo(apexX + normalX * topHalf * 0.6, apexY + normalY * topHalf * 0.6);
  ctx.stroke();
};

const drawEmberBed = (ctx: CanvasRenderingContext2D, { x, y, scale }: IFirePlace) => {
  ctx.save();
  ctx.translate(x, y + 6 * scale);
  ctx.scale(1, 0.3);
  const radius = 44 * scale;
  const bed = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  bed.addColorStop(0, "rgba(255, 176, 96, 0.8)");
  bed.addColorStop(0.4, "rgba(220, 80, 20, 0.65)");
  bed.addColorStop(1, "rgba(127, 29, 29, 0)");
  ctx.fillStyle = bed;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawFirePit = (ctx: CanvasRenderingContext2D, place: IFirePlace) => {
  const { x, y, scale } = place;
  const stones = createStones(place, createSeededRandom(17));
  const logs = createLogs(place);
  const apexX = x + 2 * scale;
  const apexY = y - TEEPEE_HEIGHT * scale;
  const fireY = y - 10 * scale;

  stones.filter((stone) => !stone.isFront).forEach((stone) => drawStone(ctx, stone, x, fireY));
  drawEmberBed(ctx, place);
  logs.filter((log) => !log.isFront).forEach((log) => drawLog(ctx, log, apexX, apexY, scale));
  logs.filter((log) => log.isFront).forEach((log) => drawLog(ctx, log, apexX, apexY, scale));
  stones.filter((stone) => stone.isFront).forEach((stone) => drawStone(ctx, stone, x, fireY));
};

// Кострище рисуется отдельным слоем поверх свечения огня: иначе ореол ложится
// на камни и поленья и засвечивает их в плоские пятна.
const PIT_HALF_WIDTH = 80;
const PIT_HALF_HEIGHT = 56;

export const renderFirePitLayer = (place: IFirePlace, pixelRatio: number): ICenteredLayer =>
  renderCenteredLayer(place, pixelRatio, PIT_HALF_WIDTH, PIT_HALF_HEIGHT, (ctx) => drawFirePit(ctx, place));
