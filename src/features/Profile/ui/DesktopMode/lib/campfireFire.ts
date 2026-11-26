import type { IFirePlace } from "./campfireScene";

interface IFireParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; tongue: number;
}

export interface IFireState {
  flames: IFireParticle[];
  sparks: IFireParticle[];
  smoke: IFireParticle[];
  tick: number;
}

export interface IFireSprites {
  core: HTMLCanvasElement;
  hot: HTMLCanvasElement;
  mid: HTMLCanvasElement;
  outer: HTMLCanvasElement;
  smoke: HTMLCanvasElement;
}

const SPRITE_SIZE = 64;
const FLAMES_PER_STEP = 5;
const SPARK_CHANCE = 0.08;
const SMOKE_EVERY = 5;
const SMOKE_ALPHA = 0.055;

const createFlameSprite = (innerRgb: string, outerRgb: string): HTMLCanvasElement => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const center = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center + 4, 0, center, center, center);
  gradient.addColorStop(0, `rgba(${innerRgb}, 1)`);
  gradient.addColorStop(0.35, `rgba(${outerRgb}, 0.75)`);
  gradient.addColorStop(0.75, `rgba(${outerRgb}, 0.25)`);
  gradient.addColorStop(1, `rgba(${outerRgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

const createSmokeSprite = (): HTMLCanvasElement => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const center = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, "rgba(160, 168, 195, 0.45)");
  gradient.addColorStop(0.5, "rgba(125, 132, 160, 0.2)");
  gradient.addColorStop(1, "rgba(90, 95, 120, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

export const createFireSprites = (): IFireSprites => ({
  core: createFlameSprite("255, 238, 175", "255, 185, 60"),
  hot: createFlameSprite("255, 175, 40", "245, 95, 18"),
  mid: createFlameSprite("245, 90, 18", "210, 40, 12"),
  outer: createFlameSprite("195, 30, 15", "120, 15, 10"),
  smoke: createSmokeSprite(),
});

export const createFireState = (): IFireState => ({ flames: [], sparks: [], smoke: [], tick: 0 });

export const getFlicker = (time: number) =>
  1 + Math.sin(time * 0.003) * 0.045 + Math.sin(time * 0.007 + 1) * 0.03 + Math.sin(time * 0.015 + 2) * 0.015;

const getWind = (tick: number) => Math.sin(tick * 0.01) * 0.18 + Math.sin(tick * 0.025 + 1) * 0.08;
const centered = () => Math.random() + Math.random() - 1;

// 5 языков пламени охватывают кострище гармонично слева направо
const TONGUES = [
  { offset: -0.75, phase: 0 }, { offset: -0.35, phase: 1.8 }, { offset: 0.05, phase: 3.5 },
  { offset: 0.4, phase: 5.1 }, { offset: 0.75, phase: 2.4 },
] as const;
const TONGUE_SPREAD = 26;
const FLAME_STRETCH = { x: 0.65, y: 1.6 } as const;

const spawnFlame = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 32 * scale,
  y: y + (centered() * 6 - 2) * scale,
  vx: centered() * 0.2 * scale,
  vy: -(0.75 + Math.random() * 0.85) * scale,
  life: 0,
  maxLife: 45 + Math.random() * 35,
  size: (20 + Math.random() * 14) * scale,
  tongue: Math.floor(Math.random() * TONGUES.length),
});

const spawnSpark = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 22 * scale, y: y - (12 + Math.random() * 20) * scale,
  vx: centered() * 0.8, vy: -(0.65 + Math.random() * 0.85) * scale,
  life: 0, maxLife: 60 + Math.random() * 60, size: (1.4 + Math.random() * 1.5) * scale, tongue: 0,
});

const spawnSmoke = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 16 * scale, y: y - 55 * scale,
  vx: centered() * 0.35, vy: -(0.45 + Math.random() * 0.3) * scale,
  life: 0, maxLife: 180 + Math.random() * 70, size: (28 + Math.random() * 12) * scale, tongue: 0,
});

export const stepFire = (state: IFireState, place: IFirePlace) => {
  state.tick++;
  const wind = getWind(state.tick) * place.scale;

  for (let i = 0; i < FLAMES_PER_STEP; i++) state.flames.push(spawnFlame(place));
  if (Math.random() < SPARK_CHANCE) state.sparks.push(spawnSpark(place));
  if (state.tick % SMOKE_EVERY === 0) state.smoke.push(spawnSmoke(place));

  state.flames.forEach((flame) => {
    flame.life++;
    const progress = flame.life / flame.maxLife;
    const tongue = TONGUES[flame.tongue];
    const sway = Math.sin(state.tick * 0.035 + tongue.phase) * 10 * progress;
    const axis = place.x + (tongue.offset * TONGUE_SPREAD + sway) * place.scale + wind * progress * 14;
    flame.x += flame.vx + (axis - flame.x) * (0.015 + progress * 0.06);
    flame.vy *= 1.002;
    flame.y += flame.vy;
  });

  state.sparks.forEach((spark) => {
    spark.life++;
    spark.vx += Math.sin(spark.life * 0.05 + spark.maxLife) * 0.03 + wind * 0.01;
    spark.vy *= 0.99;
    spark.x += spark.vx;
    spark.y += spark.vy;
  });

  state.smoke.forEach((puff) => {
    puff.life++;
    puff.x += puff.vx + wind * 0.6;
    puff.y += puff.vy;
  });

  state.flames = state.flames.filter((f) => f.life < f.maxLife);
  state.sparks = state.sparks.filter((s) => s.life < s.maxLife);
  state.smoke = state.smoke.filter((p) => p.life < p.maxLife);
};

export const drawFireGlow = (ctx: CanvasRenderingContext2D, { x, y, scale }: IFirePlace, flicker: number) => {
  const radius = 260 * scale * flicker;
  const glowY = y - 30 * scale;
  const glow = ctx.createRadialGradient(x, glowY, 0, x, glowY, radius);
  glow.addColorStop(0, `rgba(251, 146, 60, ${0.14 * flicker})`);
  glow.addColorStop(0.3, "rgba(234, 88, 12, 0.04)");
  glow.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, glowY - radius, radius * 2, radius * 2);

  ctx.save();
  ctx.translate(x, y + 10 * scale);
  ctx.scale(1, 0.3);
  const groundRadius = 170 * scale * flicker;
  const ground = ctx.createRadialGradient(0, 0, 0, 0, 0, groundRadius);
  ground.addColorStop(0, `rgba(253, 164, 80, ${0.42 * flicker})`);
  ground.addColorStop(0.3, `rgba(253, 140, 60, ${0.16 * flicker})`);
  ground.addColorStop(1, "rgba(253, 140, 60, 0)");
  ctx.fillStyle = ground;
  ctx.fillRect(-groundRadius, -groundRadius, groundRadius * 2, groundRadius * 2);
  ctx.restore();
};

const pickFlameSprite = (progress: number, sprites: IFireSprites) =>
  progress < 0.12 ? sprites.core : progress < 0.38 ? sprites.hot : progress < 0.72 ? sprites.mid : sprites.outer;

const drawSpark = (ctx: CanvasRenderingContext2D, spark: IFireParticle) => {
  const progress = spark.life / spark.maxLife;
  const alpha = (1 - progress) * (0.65 + 0.35 * Math.sin(spark.life * 0.2));
  ctx.strokeStyle = `rgba(255, 180, 70, ${alpha * 0.75})`;
  ctx.lineWidth = Math.max(1, spark.size * 0.7);
  ctx.beginPath();
  ctx.moveTo(spark.x - spark.vx * 1.5, spark.y - spark.vy * 1.5);
  ctx.lineTo(spark.x, spark.y);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 245, 200, ${alpha})`;
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, Math.max(0.8, spark.size * 0.5), 0, Math.PI * 2);
  ctx.fill();
};

export const drawFire = (
  ctx: CanvasRenderingContext2D,
  state: IFireState,
  sprites: IFireSprites,
  place: IFirePlace,
  _flicker: number,
) => {
  state.smoke.forEach((puff) => {
    const progress = puff.life / puff.maxLife;
    const currentSize = puff.size * (1 + progress * 2.2);
    ctx.globalAlpha = Math.sin(progress * Math.PI) * SMOKE_ALPHA;
    ctx.drawImage(sprites.smoke, puff.x - currentSize / 2, puff.y - currentSize / 2, currentSize, currentSize);
  });

  ctx.globalCompositeOperation = "lighter";

  state.flames.forEach((flame) => {
    const progress = flame.life / flame.maxLife;
    const fadeIn = Math.min(1, flame.life / 6);
    ctx.globalAlpha = Math.pow(1 - progress, 1.25) * 0.16 * fadeIn;
    const size = flame.size * (1 - progress * 0.65);
    const width = size * FLAME_STRETCH.x * (1 - progress * 0.35);
    const height = size * FLAME_STRETCH.y;
    ctx.drawImage(pickFlameSprite(progress, sprites), flame.x - width / 2, flame.y - height / 2, width, height);
  });

  state.sparks.forEach((spark) => drawSpark(ctx, spark));

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
