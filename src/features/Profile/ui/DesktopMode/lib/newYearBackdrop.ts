import { createSeededRandom } from "./createSeededRandom";

// Лунная зимняя ночь: холодное небо, голубоватый снег, тёмные ели по краям.
export const NEW_YEAR_PALETTE = {
  sky: ["rgb(3, 7, 26)", "rgb(10, 22, 60)", "rgb(26, 46, 100)", "rgb(48, 66, 124)"],
  stars: { count: 240, alpha: 0.85 },
  moon: "rgb(241, 245, 255)",
  moonHalo: "rgba(191, 219, 254, 0.18)",
  hillsFar: ["rgb(96, 118, 176)", "rgb(46, 62, 116)"],
  hillsNear: ["rgb(150, 172, 222)", "rgb(64, 82, 140)"],
  pines: "rgb(10, 20, 48)",
  snow: ["rgb(196, 212, 245)", "rgb(120, 140, 196)", "rgb(40, 52, 100)"],
  vignette: "rgba(2, 4, 16, 0.7)",
} as const;

const SEED = 2027;
// Ели по краям не заходят в центральную полосу: там стоит ёлка.
const PINES_CLEAR_ZONE = 0.22;

const drawSky = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.8);
  NEW_YEAR_PALETTE.sky.forEach((color, i, all) => sky.addColorStop(i / (all.length - 1), color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
};

const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, random: () => number) => {
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < NEW_YEAR_PALETTE.stars.count; i++) {
    ctx.globalAlpha = random() * NEW_YEAR_PALETTE.stars.alpha;
    ctx.beginPath();
    ctx.arc(random() * width, random() * height * 0.65, random() * 1.1 + 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const drawMoon = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const x = width * 0.82;
  const y = height * 0.15;
  const radius = Math.min(width, height) * 0.042;
  const halo = ctx.createRadialGradient(x, y, radius, x, y, radius * 6);
  halo.addColorStop(0, NEW_YEAR_PALETTE.moonHalo);
  halo.addColorStop(1, "rgba(191, 219, 254, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius * 6, y - radius * 6, radius * 12, radius * 12);
  ctx.fillStyle = NEW_YEAR_PALETTE.moon;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

const drawHills = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  colors: readonly [string, string],
  random: () => number,
) => {
  const phase = random() * Math.PI * 2;
  const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 8) {
    const t = x / width;
    const y = baseY - Math.sin(t * Math.PI * 2.2 + phase) * amplitude - Math.sin(t * Math.PI * 5.3) * amplitude * 0.3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
};

const drawPine = (ctx: CanvasRenderingContext2D, x: number, baseY: number, size: number) => {
  ctx.beginPath();
  ctx.moveTo(x, baseY - size);
  ctx.lineTo(x + size * 0.32, baseY);
  ctx.lineTo(x - size * 0.32, baseY);
  ctx.closePath();
  ctx.fill();
};

const drawSidePines = (ctx: CanvasRenderingContext2D, width: number, baseY: number, random: () => number) => {
  ctx.fillStyle = NEW_YEAR_PALETTE.pines;
  const count = Math.round(width / 38);
  for (let i = 0; i < count; i++) {
    const t = random();
    if (Math.abs(t - 0.5) < PINES_CLEAR_ZONE) continue;
    // Чем ближе к краю, тем крупнее ель — края кадра «ближе» к зрителю.
    const edge = Math.abs(t - 0.5) * 2;
    const size = (40 + random() * 50) * (0.6 + edge);
    drawPine(ctx, t * width, baseY + random() * 14, size);
  }
};

const drawSnowField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const top = height * 0.8;
  const gradient = ctx.createLinearGradient(0, top, 0, height);
  NEW_YEAR_PALETTE.snow.forEach((color, i, all) => gradient.addColorStop(i / (all.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, top + 18);
  ctx.quadraticCurveTo(width * 0.25, top - 10, width * 0.5, top + 4);
  ctx.quadraticCurveTo(width * 0.75, top + 16, width, top - 6);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
};

const drawVignette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const radius = Math.max(width, height) * 0.75;
  const vignette = ctx.createRadialGradient(width / 2, height * 0.55, radius * 0.4, width / 2, height * 0.55, radius);
  vignette.addColorStop(0, "rgba(2, 4, 16, 0)");
  vignette.addColorStop(1, NEW_YEAR_PALETTE.vignette);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
};

/** Статичный задник сцены: рисуется один раз на размер экрана, а не каждый кадр. */
export const renderNewYearBackdrop = (width: number, height: number, pixelRatio: number) => {
  const layer = document.createElement("canvas");
  layer.width = Math.round(width * pixelRatio);
  layer.height = Math.round(height * pixelRatio);
  const ctx = layer.getContext("2d");
  if (!ctx) return layer;

  const random = createSeededRandom(SEED);
  ctx.scale(pixelRatio, pixelRatio);
  drawSky(ctx, width, height);
  drawStars(ctx, width, height, random);
  drawMoon(ctx, width, height);
  drawHills(ctx, width, height, height * 0.7, height * 0.035, NEW_YEAR_PALETTE.hillsFar, random);
  drawSidePines(ctx, width, height * 0.76, random);
  drawHills(ctx, width, height, height * 0.79, height * 0.02, NEW_YEAR_PALETTE.hillsNear, random);
  drawSnowField(ctx, width, height);
  drawVignette(ctx, width, height);
  return layer;
};
