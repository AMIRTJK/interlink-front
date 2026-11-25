export interface ISnowLayer {
  count: number;
  radius: [number, number];
  speed: [number, number];
  opacity: [number, number];
  // Насколько слой подхватывает ветер: дальние почти не сносит — так читается глубина.
  windFactor: number;
  isBokeh: boolean;
}

export interface ISnowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  phase: number;
  sway: number;
  layer: ISnowLayer;
}

export const SNOW_LAYERS: ISnowLayer[] = [
  { count: 130, radius: [0.8, 1.6], speed: [0.25, 0.5], opacity: [0.35, 0.6], windFactor: 0.4, isBokeh: false },
  { count: 70, radius: [2, 3.4], speed: [0.6, 1], opacity: [0.7, 0.95], windFactor: 0.8, isBokeh: false },
  { count: 14, radius: [9, 16], speed: [1.2, 1.8], opacity: [0.3, 0.5], windFactor: 1.3, isBokeh: true },
];

const SPRITE_SIZE = 64;

const SNOW_PALETTE = {
  dark: {
    sky: ["rgb(6, 11, 31)", "rgb(19, 30, 66)", "rgb(39, 54, 99)"],
    glow: "rgba(96, 165, 250, 0.16)",
    moon: "rgba(241, 245, 249, 0.95)",
    halo: "rgba(241, 245, 249, 0.25)",
    drifts: ["rgba(148, 163, 184, 0.22)", "rgba(203, 213, 225, 0.32)"],
  },
  light: {
    sky: ["rgb(148, 175, 210)", "rgb(190, 209, 232)", "rgb(226, 234, 244)"],
    glow: "rgba(255, 255, 255, 0.55)",
    moon: "rgba(255, 255, 255, 0.7)",
    halo: "rgba(255, 255, 255, 0.3)",
    drifts: ["rgba(255, 255, 255, 0.55)", "rgba(255, 255, 255, 0.9)"],
  },
} as const;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);

export const createSnowflake = (
  layer: ISnowLayer,
  width: number,
  height: number,
  isFromTop = false,
): ISnowflake => {
  const radius = between(layer.radius);
  return {
    x: Math.random() * width,
    y: isFromTop ? -radius * 4 : Math.random() * height,
    radius,
    speed: between(layer.speed),
    opacity: between(layer.opacity),
    phase: Math.random() * Math.PI * 2,
    sway: Math.random() * 0.5 + 0.15,
    layer,
  };
};

// Хлопья рисуются готовым спрайтом через drawImage: радиальный градиент на каждую
// снежинку в каждом кадре заметно дороже.
export const createFlakeSprite = (isBokeh: boolean): HTMLCanvasElement => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;

  const center = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  if (isBokeh) {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.45)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

const drawDrift = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  seed: number,
  color: string,
) => {
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x += 8) {
    const wave = Math.sin(x * 0.004 + seed) * amplitude + Math.sin(x * 0.011 + seed * 2) * amplitude * 0.4;
    ctx.lineTo(x, baseY + wave);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

// Небо, свечение луны и сугробы статичны — рисуются один раз в отдельный canvas при старте и ресайзе.
export const renderSnowBackdrop = (width: number, height: number, isDark: boolean): HTMLCanvasElement => {
  const backdrop = document.createElement("canvas");
  backdrop.width = width;
  backdrop.height = height;
  const ctx = backdrop.getContext("2d");
  if (!ctx) return backdrop;

  const palette = isDark ? SNOW_PALETTE.dark : SNOW_PALETTE.light;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, palette.sky[0]);
  sky.addColorStop(0.6, palette.sky[1]);
  sky.addColorStop(1, palette.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const glowX = width * 0.78;
  const glowY = height * 0.18;
  const glowRadius = Math.max(width, height) * 0.45;
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const moonRadius = Math.min(width, height) * 0.045;
  const halo = ctx.createRadialGradient(glowX, glowY, moonRadius, glowX, glowY, moonRadius * 4);
  halo.addColorStop(0, palette.halo);
  halo.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(glowX, glowY, moonRadius, 0, Math.PI * 2);
  ctx.fillStyle = palette.moon;
  ctx.fill();

  drawDrift(ctx, width, height, height * 0.86, 22, 1.3, palette.drifts[0]);
  drawDrift(ctx, width, height, height * 0.92, 16, 4.1, palette.drifts[1]);
  return backdrop;
};

// Ветер — сумма двух медленных синусоид: порывы без резких рывков и без случайного шума.
export const getWind = (time: number) => Math.sin(time * 0.00025) * 0.6 + Math.sin(time * 0.0009) * 0.25;
