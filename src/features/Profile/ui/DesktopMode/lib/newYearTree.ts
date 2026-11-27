import { createSeededRandom } from "./createSeededRandom";

export interface ITreePlace {
  x: number;
  baseY: number;
  height: number;
}

export interface ITreeBounds {
  anchorBottom: number;
  footerTop: number;
}

/** Огонёк гирлянды; координаты — от основания ёлки в единицах её высоты. */
export interface ITreeLight {
  dx: number;
  dy: number;
  color: number;
  phase: number;
  speed: number;
}

export interface ITreeLayer {
  canvas: HTMLCanvasElement;
  /** Точка основания ствола внутри слоя (CSS-пиксели при высоте ёлки 1). */
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
  lights: ITreeLight[];
}

export const LIGHT_COLORS = ["#fde68a", "#f87171", "#60a5fa", "#4ade80", "#f472b6"] as const;

const TIERS = 5;
const WIDTH_RATIO = 0.62;
const TRUNK_RATIO = 0.07;
const STAR_RATIO = 0.06;
const LIGHTS_PER_TIER = [4, 6, 8, 10, 12];
const FIT_GAP = 8;
const MIN_HEIGHT = 140;
const MAX_HEIGHT = 560;
const SEED = 1231;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Ёлка занимает промежуток между карточкой (или подсказкой) и переключателем сцен.
export const getTreePlace = (width: number, height: number, bounds: ITreeBounds | null): ITreePlace => {
  const widthLimit = (width * 0.9) / WIDTH_RATIO;
  if (!bounds) {
    return { x: width / 2, baseY: height * 0.86, height: clamp(height * 0.34, MIN_HEIGHT, MAX_HEIGHT) };
  }
  const gap = bounds.footerTop - bounds.anchorBottom - FIT_GAP * 2;
  return {
    x: width / 2,
    baseY: bounds.footerTop - FIT_GAP,
    height: clamp(gap, MIN_HEIGHT, Math.min(MAX_HEIGHT, widthLimit, height * 0.55)),
  };
};

interface ITier {
  top: number;
  bottom: number;
  halfWidth: number;
  sag: number;
}

// Ярусы сверху вниз, в долях высоты ёлки от основания (y растёт вниз, основание = 0).
const getTiers = (): ITier[] => {
  const foliageTop = -(1 - STAR_RATIO);
  const foliageBottom = -TRUNK_RATIO;
  const span = foliageBottom - foliageTop;
  return Array.from({ length: TIERS }, (_, i) => ({
    top: foliageTop + span * i * 0.17,
    bottom: foliageTop + span * (0.3 + i * 0.175),
    halfWidth: (WIDTH_RATIO / 2) * (0.34 + i * 0.165),
    sag: 0.03,
  }));
};

const pointOnEdge = (tier: ITier, t: number) => {
  // Квадратичная кривая нижнего края яруса: справа налево с провисом посередине.
  const x0 = tier.halfWidth;
  const x2 = -tier.halfWidth;
  const y = tier.bottom;
  const cy = tier.bottom + tier.sag * 2;
  const mt = 1 - t;
  return { x: mt * mt * x0 + t * t * x2, y: mt * mt * y + 2 * mt * t * cy + t * t * y };
};

const traceTier = (ctx: CanvasRenderingContext2D, tier: ITier) => {
  ctx.beginPath();
  ctx.moveTo(0, tier.top);
  ctx.quadraticCurveTo(tier.halfWidth * 0.35, tier.top + (tier.bottom - tier.top) * 0.6, tier.halfWidth, tier.bottom);
  ctx.quadraticCurveTo(0, tier.bottom + tier.sag * 2, -tier.halfWidth, tier.bottom);
  ctx.quadraticCurveTo(-tier.halfWidth * 0.35, tier.top + (tier.bottom - tier.top) * 0.6, 0, tier.top);
  ctx.closePath();
};

const drawStarShape = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
};

const drawTree = (ctx: CanvasRenderingContext2D, tiers: ITier[]) => {
  ctx.fillStyle = "rgb(58, 36, 24)";
  ctx.fillRect(-0.035, -TRUNK_RATIO - 0.02, 0.07, TRUNK_RATIO + 0.02);

  tiers.forEach((tier) => {
    // Луна справа: правая сторона яруса светлее левой.
    const shade = ctx.createLinearGradient(-tier.halfWidth, 0, tier.halfWidth, 0);
    shade.addColorStop(0, "rgb(6, 38, 30)");
    shade.addColorStop(1, "rgb(20, 83, 62)");
    ctx.fillStyle = shade;
    traceTier(ctx, tier);
    ctx.fill();

    ctx.strokeStyle = "rgba(226, 236, 255, 0.85)";
    ctx.lineWidth = 0.014;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tier.halfWidth, tier.bottom);
    ctx.quadraticCurveTo(0, tier.bottom + tier.sag * 2, -tier.halfWidth, tier.bottom);
    ctx.stroke();
  });

  ctx.fillStyle = "rgb(253, 224, 71)";
  drawStarShape(ctx, 0, -(1 - STAR_RATIO), STAR_RATIO * 0.85);
};

const createLights = (tiers: ITier[]): ITreeLight[] => {
  const random = createSeededRandom(SEED);
  return tiers.flatMap((tier, i) =>
    Array.from({ length: LIGHTS_PER_TIER[i] }, (_, j) => {
      const t = (j + 0.5) / LIGHTS_PER_TIER[i];
      const point = pointOnEdge(tier, t);
      return {
        dx: point.x * 0.92,
        dy: point.y - 0.012,
        color: Math.floor(random() * LIGHT_COLORS.length),
        phase: random() * Math.PI * 2,
        speed: 0.0015 + random() * 0.002,
      };
    }),
  );
};

/** Слой ёлки под заданную высоту; при плавном переходе он масштабируется, а не перерисовывается. */
export const renderTreeLayer = (treeHeight: number, pixelRatio: number): ITreeLayer => {
  const width = treeHeight * WIDTH_RATIO * 1.1;
  const height = treeHeight * 1.04;
  const anchorX = width / 2;
  const anchorY = height - treeHeight * 0.02;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const tiers = getTiers();
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(treeHeight * pixelRatio, 0, 0, treeHeight * pixelRatio, anchorX * pixelRatio, anchorY * pixelRatio);
    drawTree(ctx, tiers);
  }
  return {
    canvas,
    anchorX: anchorX / treeHeight,
    anchorY: anchorY / treeHeight,
    width: width / treeHeight,
    height: height / treeHeight,
    lights: createLights(tiers),
  };
};

export const TREE_STAR_OFFSET = -(1 - STAR_RATIO);
