import type { IFirePlace } from "./campfireScene";

interface IFireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface IFireState {
  flames: IFireParticle[];
  sparks: IFireParticle[];
}

export interface IFireSprites {
  core: HTMLCanvasElement;
  mid: HTMLCanvasElement;
  outer: HTMLCanvasElement;
  spark: HTMLCanvasElement;
}

const SPRITE_SIZE = 64;
const FLAMES_PER_STEP = 3;
const SPARK_CHANCE = 0.18;

const createSprite = (rgb: string): HTMLCanvasElement => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;

  const center = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, `rgba(${rgb}, 1)`);
  gradient.addColorStop(0.4, `rgba(${rgb}, 0.5)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

// По спрайту на стадию жизни частицы: перекрашивать один спрайт в каждом кадре дороже.
export const createFireSprites = (): IFireSprites => ({
  core: createSprite("255, 240, 200"),
  mid: createSprite("251, 146, 60"),
  outer: createSprite("220, 38, 38"),
  spark: createSprite("253, 186, 116"),
});

export const createFireState = (): IFireState => ({ flames: [], sparks: [] });

// Неровное «дыхание» огня — сумма синусоид с некратными частотами, без повторяющегося ритма.
export const getFlicker = (time: number) =>
  1 + Math.sin(time * 0.013) * 0.05 + Math.sin(time * 0.029 + 1) * 0.035 + Math.sin(time * 0.051 + 2) * 0.02;

const spawnFlame = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + (Math.random() - 0.5) * 44 * scale,
  y: y - 6 * scale,
  vx: (Math.random() - 0.5) * 0.4 * scale,
  vy: -(1.1 + Math.random() * 1.3) * scale,
  life: 0,
  maxLife: 40 + Math.random() * 30,
  size: (26 + Math.random() * 16) * scale,
});

const spawnSpark = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + (Math.random() - 0.5) * 30 * scale,
  y: y - 20 * scale,
  vx: (Math.random() - 0.5) * 0.9,
  vy: -(2 + Math.random() * 2.2) * scale,
  life: 0,
  maxLife: 80 + Math.random() * 90,
  size: (2 + Math.random() * 2.5) * scale,
});

export const stepFire = (state: IFireState, place: IFirePlace) => {
  for (let i = 0; i < FLAMES_PER_STEP; i++) state.flames.push(spawnFlame(place));
  if (Math.random() < SPARK_CHANCE) state.sparks.push(spawnSpark(place));

  // Языки пламени стягиваются к оси костра — так из облака частиц получается конус огня.
  state.flames.forEach((flame) => {
    flame.life++;
    flame.x += flame.vx + (place.x - flame.x) * 0.035;
    flame.y += flame.vy;
  });

  state.sparks.forEach((spark) => {
    spark.life++;
    spark.vx += Math.sin(spark.life * 0.06 + spark.maxLife) * 0.03;
    spark.vy *= 0.993;
    spark.x += spark.vx;
    spark.y += spark.vy;
  });

  state.flames = state.flames.filter((flame) => flame.life < flame.maxLife);
  state.sparks = state.sparks.filter((spark) => spark.life < spark.maxLife);
};

export const drawFireGlow = (ctx: CanvasRenderingContext2D, place: IFirePlace, flicker: number) => {
  const radius = 260 * place.scale * flicker;
  const glow = ctx.createRadialGradient(place.x, place.y, 0, place.x, place.y, radius);
  glow.addColorStop(0, `rgba(251, 146, 60, ${0.32 * flicker})`);
  glow.addColorStop(0.45, "rgba(234, 88, 12, 0.1)");
  glow.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(place.x - radius, place.y - radius, radius * 2, radius * 2);
};

const pickFlameSprite = (progress: number, sprites: IFireSprites) => {
  if (progress < 0.18) return sprites.core;
  return progress < 0.6 ? sprites.mid : sprites.outer;
};

// Режим lighter складывает яркость перекрывающихся частиц — центр огня выгорает до белого.
export const drawFire = (ctx: CanvasRenderingContext2D, state: IFireState, sprites: IFireSprites) => {
  ctx.globalCompositeOperation = "lighter";

  state.flames.forEach((flame) => {
    const progress = flame.life / flame.maxLife;
    const size = flame.size * (1 - progress * 0.7);
    ctx.globalAlpha = (1 - progress) * 0.3;
    ctx.drawImage(pickFlameSprite(progress, sprites), flame.x - size / 2, flame.y - size / 2, size, size);
  });

  state.sparks.forEach((spark) => {
    const progress = spark.life / spark.maxLife;
    const size = spark.size * 3;
    ctx.globalAlpha = (1 - progress) * (0.6 + Math.random() * 0.4);
    ctx.drawImage(sprites.spark, spark.x - size / 2, spark.y - size / 2, size, size);
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
