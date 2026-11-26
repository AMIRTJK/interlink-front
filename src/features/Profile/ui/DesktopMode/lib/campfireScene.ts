import { createSeededRandom } from "./createSeededRandom";
import { drawForestRow, drawFrameTrees, drawGround, drawMist, drawMountains } from "./campfireForest";

export interface IFirePlace {
  x: number;
  y: number;
  scale: number;
}

const MOBILE_BREAKPOINT = 768;
// Насколько камни уходят ниже точки огня и насколько видимое пламя поднимается
// над ней (в единицах масштаба) — по этим величинам огонь вписывается в промежуток.
const PIT_DEPTH = 30;
const FLAME_REACH = 110;
const FIT_GAP = 8;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.7;

export interface IFireBounds {
  anchorBottom: number;
  footerTop: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Костёр — центр сцены: стоит вплотную над переключателем сцен, а размер подобран
// так, чтобы пламя целиком помещалось под карточкой или подсказкой.
export const getFirePlace = (width: number, height: number, bounds: IFireBounds | null): IFirePlace => {
  const widthLimit = width / (width < MOBILE_BREAKPOINT ? 260 : 420);
  if (!bounds) {
    const scale = clamp(height / 600, MIN_SCALE, Math.min(MAX_SCALE, widthLimit));
    return { x: width / 2, y: height * 0.82, scale };
  }
  const gap = bounds.footerTop - bounds.anchorBottom - FIT_GAP * 2;
  const scale = clamp(gap / (FLAME_REACH + PIT_DEPTH), MIN_SCALE, Math.min(MAX_SCALE, widthLimit));
  return { x: width / 2, y: bounds.footerTop - FIT_GAP - PIT_DEPTH * scale, scale };
};

// Сцена всегда ночная. Слои леса от дальнего к ближнему темнеют — воздушная
// перспектива даёт глубину без размытия.
const CAMPFIRE_PALETTE = {
  sky: ["rgb(2, 6, 24)", "rgb(12, 20, 54)", "rgb(30, 34, 86)", "rgb(58, 44, 96)"],
  horizonGlow: "rgba(251, 146, 60, 0.1)",
  stars: { count: 260, alpha: 0.95 },
  moon: "rgb(254, 249, 215)",
  moonHalo: "rgba(254, 249, 195, 0.16)",
  mountains: "rgb(30, 32, 78)",
  forest: ["rgb(22, 25, 64)", "rgb(14, 16, 46)", "rgb(8, 9, 30)"],
  ground: ["rgb(22, 20, 52)", "rgb(3, 3, 12)"],
  groundSheen: "rgba(130, 130, 230, 0.12)",
  mist: "rgba(129, 140, 248, 0.1)",
  frame: "rgb(3, 3, 12)",
  vignette: "rgba(1, 2, 10, 0.75)",
} as const;

type TPalette = typeof CAMPFIRE_PALETTE;


const drawSky = (ctx: CanvasRenderingContext2D, width: number, height: number, palette: TPalette) => {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
  palette.sky.forEach((color, index) => sky.addColorStop(index / (palette.sky.length - 1), color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.72);
  glow.addColorStop(0, "rgba(0, 0, 0, 0)");
  glow.addColorStop(0.75, palette.horizonGlow);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, height * 0.4, width, height * 0.32);
};

const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, palette: TPalette) => {
  const random = createSeededRandom(7);
  ctx.save();
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
  for (let i = 0; i < palette.stars.count; i++) {
    const x = random() * width;
    // Звёзды гуще в зените и редеют к горизонту.
    const y = Math.pow(random(), 1.6) * height * 0.6;
    const isBright = random() < 0.08;
    ctx.globalAlpha = palette.stars.alpha * (isBright ? 1 : 0.25 + random() * 0.6);
    ctx.shadowBlur = isBright ? 6 : 0;
    ctx.beginPath();
    ctx.arc(x, y, isBright ? 1.4 : random() * 0.9 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// Серп вырезаем во временном canvas: destination-out на основном стёр бы небо под луной.
const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, palette: TPalette) => {
  const halo = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 4);
  halo.addColorStop(0, palette.moonHalo);
  halo.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);

  const size = Math.ceil(radius * 2 + 4);
  const moon = document.createElement("canvas");
  moon.width = moon.height = size;
  const moonCtx = moon.getContext("2d");
  if (!moonCtx) return;

  const center = size / 2;
  moonCtx.fillStyle = palette.moon;
  moonCtx.beginPath();
  moonCtx.arc(center, center, radius * 0.8, 0, Math.PI * 2);
  moonCtx.fill();
  moonCtx.globalCompositeOperation = "destination-out";
  moonCtx.beginPath();
  moonCtx.arc(center + radius * 0.38, center - radius * 0.18, radius * 0.72, 0, Math.PI * 2);
  moonCtx.fill();

  ctx.save();
  ctx.shadowColor = palette.moon;
  ctx.shadowBlur = radius * 0.5;
  ctx.drawImage(moon, x - center, y - center);
  ctx.restore();
};

export interface ILandscapePalette {
  mountains: string;
  forest: readonly [string, string, string];
  ground: readonly [string, string];
  // Отсвет на гребнях бугров поляны.
  groundSheen: string;
  mist: string | null;
  // Самые ближние ели по краям экрана.
  frame: string;
}

// Горы, три ряда леса и поляна. Вынесено отдельно: слой света от костра рисует
// тот же лес теми же сидами, только в тёплых цветах.
export const drawLandscape = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: ILandscapePalette,
) => {
  const treeScale = Math.min(Math.max(height / 900, 0.65), 1.3);
  const [far, middle, near] = palette.forest;
  const mist = (y: number, depth: number) => {
    if (palette.mist) drawMist(ctx, width, height * y, height * depth, palette.mist);
  };

  drawMountains(ctx, width, height, height * 0.64, height * 0.14, palette.mountains);
  mist(0.64, 0.08);
  drawForestRow(ctx, width, height, { base: height * 0.655, waviness: height * 0.01, treeHeight: [45, 95], color: far, seed: 11 }, treeScale);
  mist(0.67, 0.06);
  drawForestRow(ctx, width, height, { base: height * 0.71, waviness: height * 0.012, treeHeight: [70, 135], color: middle, seed: 23 }, treeScale);
  const nearEdge = drawForestRow(ctx, width, height, { base: height * 0.765, waviness: height * 0.014, treeHeight: [100, 190], color: near, seed: 31 }, treeScale);
  drawGround(ctx, width, height, (x) => nearEdge(x) + 1, palette.ground, palette.groundSheen);
  drawFrameTrees(ctx, width, height, palette.frame);
};

// Края экрана уходят в темноту — взгляд собирается к огню.
const drawVignette = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
  const radius = Math.hypot(width, height) * 0.62;
  const vignette = ctx.createRadialGradient(width / 2, height * 0.72, radius * 0.35, width / 2, height * 0.72, radius);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, color);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
};

// Небо и лес не двигаются — рисуются один раз при старте и ресайзе.
export const renderCampfireBackdrop = (
  width: number,
  height: number,
  pixelRatio: number,
): HTMLCanvasElement => {
  const backdrop = document.createElement("canvas");
  backdrop.width = Math.round(width * pixelRatio);
  backdrop.height = Math.round(height * pixelRatio);
  const ctx = backdrop.getContext("2d");
  if (!ctx) return backdrop;
  ctx.scale(pixelRatio, pixelRatio);

  const palette = CAMPFIRE_PALETTE;

  drawSky(ctx, width, height, palette);
  drawStars(ctx, width, height, palette);
  drawMoon(ctx, width * 0.8, height * 0.15, Math.min(width, height) * 0.05, palette);

  drawLandscape(ctx, width, height, palette);
  drawVignette(ctx, width, height, palette.vignette);
  return backdrop;
};
