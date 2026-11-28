import { LIGHT_COLORS, TREE_STAR_OFFSET, type ITreeLayer, type ITreePlace } from "./newYearTree";

interface ITwinkle {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

const TWINKLE_COUNT = 70;
const SPRITE_SIZE = 64;

export const createTwinkles = (width: number, height: number): ITwinkle[] =>
  Array.from({ length: TWINKLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 0.55,
    radius: 0.8 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0008 + Math.random() * 0.0016,
  }));

export const drawTwinkles = (ctx: CanvasRenderingContext2D, twinkles: ITwinkle[], time: number) => {
  ctx.fillStyle = "#ffffff";
  twinkles.forEach((star) => {
    ctx.globalAlpha = 0.15 + 0.85 * Math.max(0, Math.sin(time * star.speed + star.phase));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
};

const createGlowSprite = (color: string) => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const half = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.25, color);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

/** Ореолы огоньков: радиальный градиент на каждую лампочку каждый кадр слишком дорог. */
export const createGlowSprites = () => LIGHT_COLORS.map(createGlowSprite);

const drawSprite = (ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement, x: number, y: number, size: number) =>
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);

export const drawWarmGlow = (
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  time: number,
) => {
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.16 + Math.sin(time * 0.0012) * 0.04;
  drawSprite(ctx, sprite, x, y, radius * 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};

export const drawTreeLayer = (ctx: CanvasRenderingContext2D, layer: ITreeLayer, place: ITreePlace) => {
  const h = place.height;
  ctx.drawImage(layer.canvas, place.x - layer.anchorX * h, place.baseY - layer.anchorY * h, layer.width * h, layer.height * h);
};

export const drawTreeLights = (
  ctx: CanvasRenderingContext2D,
  layer: ITreeLayer,
  place: ITreePlace,
  sprites: HTMLCanvasElement[],
  time: number,
) => {
  const h = place.height;
  const glowSize = Math.max(10, h * 0.07);
  ctx.globalCompositeOperation = "lighter";
  layer.lights.forEach((light) => {
    ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * light.speed + light.phase));
    drawSprite(ctx, sprites[light.color], place.x + light.dx * h, place.baseY + light.dy * h, glowSize);
  });
  ctx.globalAlpha = 0.6 + 0.25 * Math.sin(time * 0.002);
  drawSprite(ctx, sprites[0], place.x, place.baseY + TREE_STAR_OFFSET * h, h * 0.22);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
