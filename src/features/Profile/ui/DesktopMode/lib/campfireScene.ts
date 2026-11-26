export interface IFirePlace {
  x: number;
  y: number;
  scale: number;
}

const MOBILE_BREAKPOINT = 768;

const CAMPFIRE_PALETTE = {
  dark: {
    sky: ["rgb(2, 6, 23)", "rgb(15, 23, 42)", "rgb(30, 27, 58)"],
    starAlpha: 0.85,
    moon: "rgb(254, 249, 195)",
    treesBack: "rgb(17, 24, 39)",
    treesFront: "rgb(3, 7, 18)",
  },
  light: {
    sky: ["rgb(165, 180, 252)", "rgb(251, 207, 232)", "rgb(254, 215, 170)"],
    starAlpha: 0.3,
    moon: "rgb(255, 251, 235)",
    treesBack: "rgb(124, 118, 176)",
    treesFront: "rgb(55, 48, 107)",
  },
} as const;

const LOG_COLOR = "rgb(66, 32, 16)";
const STONE_COLOR = "rgb(41, 37, 36)";

// Костёр стоит сбоку от карточки с паролем и выше переключателя сцен, который занимает низ экрана.
export const getFirePlace = (width: number, height: number): IFirePlace => ({
  x: width * (width < MOBILE_BREAKPOINT ? 0.8 : 0.2),
  y: height * 0.8,
  scale: Math.min(Math.max(Math.min(width, height) / 620, 0.7), 1.3),
});

// Детерминированный генератор: после ресайза лес и звёзды стоят на тех же местах.
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number) => {
  const random = createRandom(7);
  ctx.fillStyle = "rgb(255, 255, 255)";
  for (let i = 0; i < 160; i++) {
    ctx.globalAlpha = alpha * (0.3 + random() * 0.7);
    ctx.beginPath();
    ctx.arc(random() * width, random() * height * 0.7, random() * 1.2 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

// Серп вырезаем во временном canvas: destination-out на основном стёр бы небо под луной.
// Свечение накладываем уже на готовый серп, иначе вырез оставляет тёмный диск.
const drawCrescent = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
  const size = Math.ceil(radius * 2 + 4);
  const moon = document.createElement("canvas");
  moon.width = moon.height = size;
  const moonCtx = moon.getContext("2d");
  if (!moonCtx) return;

  const center = size / 2;
  moonCtx.fillStyle = color;
  moonCtx.beginPath();
  moonCtx.arc(center, center, radius * 0.8, 0, Math.PI * 2);
  moonCtx.fill();
  moonCtx.globalCompositeOperation = "destination-out";
  moonCtx.beginPath();
  moonCtx.arc(center + radius * 0.38, center - radius * 0.18, radius * 0.72, 0, Math.PI * 2);
  moonCtx.fill();
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = radius * 0.6;
  ctx.drawImage(moon, x - center, y - center);
  ctx.restore();
};

const drawPineRow = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  treeHeight: [number, number],
  color: string,
  seed: number,
) => {
  const random = createRandom(seed);
  ctx.fillStyle = color;
  ctx.fillRect(0, baseY, width, height - baseY);

  for (let x = -20; x < width + 40; x += 14 + random() * 26) {
    const treeH = treeHeight[0] + random() * (treeHeight[1] - treeHeight[0]);
    const halfW = treeH * 0.22;
    // Ель — три яруса треугольников, каждый следующий уже и выше предыдущего.
    for (let tier = 0; tier < 3; tier++) {
      const tierBottom = baseY - treeH * tier * 0.28;
      const tierHalfW = halfW * (1 - tier * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - tierHalfW, tierBottom);
      ctx.lineTo(x, tierBottom - treeH * 0.5);
      ctx.lineTo(x + tierHalfW, tierBottom);
      ctx.closePath();
      ctx.fill();
    }
  }
};

const drawFirePit = (ctx: CanvasRenderingContext2D, { x, y, scale }: IFirePlace) => {
  ctx.fillStyle = STONE_COLOR;
  for (let i = 0; i < 9; i++) {
    const angle = Math.PI * (0.05 + (i / 8) * 0.9);
    ctx.beginPath();
    ctx.ellipse(x - Math.cos(angle) * 46 * scale, y + 6 * scale, 10 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = LOG_COLOR;
  [-0.32, 0.32].forEach((rotation) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.roundRect(-38 * scale, -7 * scale, 76 * scale, 14 * scale, 7 * scale);
    ctx.fill();
    ctx.restore();
  });
};

// Небо, звёзды, луна, лес и кострище не двигаются — рисуются один раз при старте и ресайзе.
export const renderCampfireBackdrop = (
  width: number,
  height: number,
  isDark: boolean,
  place: IFirePlace,
): HTMLCanvasElement => {
  const backdrop = document.createElement("canvas");
  backdrop.width = width;
  backdrop.height = height;
  const ctx = backdrop.getContext("2d");
  if (!ctx) return backdrop;

  const palette = isDark ? CAMPFIRE_PALETTE.dark : CAMPFIRE_PALETTE.light;

  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.8);
  sky.addColorStop(0, palette.sky[0]);
  sky.addColorStop(0.6, palette.sky[1]);
  sky.addColorStop(1, palette.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawStars(ctx, width, height, palette.starAlpha);
  drawCrescent(ctx, width * 0.8, height * 0.16, Math.min(width, height) * 0.05, palette.moon);
  drawPineRow(ctx, width, height, height * 0.66, [60, 120], palette.treesBack, 11);
  drawPineRow(ctx, width, height, height * 0.74, [90, 170], palette.treesFront, 23);
  drawFirePit(ctx, place);
  return backdrop;
};
