import type { IFirePlace } from "./campfireScene";

interface IFireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  tongue: number;
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
  spark: HTMLCanvasElement;
  smoke: HTMLCanvasElement;
}

const SPRITE_SIZE = 64;
const FLAMES_PER_STEP = 8;
const SPARK_CHANCE = 0.07;
const SMOKE_EVERY = 6;
const SMOKE_ALPHA = 0.015;

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
  core: createSprite("255, 244, 214"),
  hot: createSprite("253, 190, 84"),
  mid: createSprite("249, 115, 22"),
  outer: createSprite("185, 28, 28"),
  spark: createSprite("253, 186, 116"),
  smoke: createSprite("120, 113, 108"),
});

export const createFireState = (): IFireState => ({ flames: [], sparks: [], smoke: [], tick: 0 });

// Неровное «дыхание» огня — сумма синусоид с некратными частотами, без повторяющегося ритма.
export const getFlicker = (time: number) =>
  1 + Math.sin(time * 0.013) * 0.05 + Math.sin(time * 0.029 + 1) * 0.035 + Math.sin(time * 0.051 + 2) * 0.02;

const getWind = (tick: number) => Math.sin(tick * 0.017) * 0.22 + Math.sin(tick * 0.047 + 1) * 0.1;

// Сумма двух случайных даёт треугольное распределение: огонь плотнее в центре, реже по краям.
const centered = () => Math.random() + Math.random() - 1;

// Языки пламени: смещение от центра и фаза колыхания. Частица привязана к одному
// языку — так огонь читается как несколько живых языков, а не как один столб.
const TONGUES = [
  { offset: -0.55, phase: 0 },
  { offset: 0, phase: 2.1 },
  { offset: 0.5, phase: 4.2 },
] as const;
const TONGUE_SPREAD = 20;
// Языки вытянуты вверх: частица рисуется выше, чем шире, — так пламя не сливается в шар.
const FLAME_STRETCH = { x: 0.7, y: 1.45 } as const;

const spawnFlame = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 38 * scale,
  y: y - 6 * scale,
  vx: centered() * 0.25 * scale,
  vy: -(1.3 + Math.random() * 1.5) * scale,
  life: 0,
  maxLife: 24 + Math.random() * 26,
  size: (18 + Math.random() * 14) * scale,
  tongue: Math.floor(Math.random() * TONGUES.length),
});

const spawnSpark = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 26 * scale,
  y: y - 34 * scale,
  vx: centered() * 1.3,
  vy: -(1.2 + Math.random() * 1.6) * scale,
  life: 0,
  maxLife: 40 + Math.random() * 60,
  size: (1.4 + Math.random() * 1.8) * scale,
  tongue: 0,
});

const spawnSmoke = ({ x, y, scale }: IFirePlace): IFireParticle => ({
  x: x + centered() * 16 * scale,
  y: y - 80 * scale,
  vx: centered() * 0.25,
  vy: -(0.4 + Math.random() * 0.3) * scale,
  life: 0,
  maxLife: 150 + Math.random() * 80,
  size: 34 * scale,
  tongue: 0,
});

export const stepFire = (state: IFireState, place: IFirePlace) => {
  state.tick++;
  const wind = getWind(state.tick) * place.scale;

  for (let i = 0; i < FLAMES_PER_STEP; i++) state.flames.push(spawnFlame(place));
  if (Math.random() < SPARK_CHANCE) state.sparks.push(spawnSpark(place));
  if (state.tick % SMOKE_EVERY === 0) state.smoke.push(spawnSmoke(place));

  // Каждая частица тянется к оси своего языка; ось колышется и к верху сносится ветром.
  state.flames.forEach((flame) => {
    flame.life++;
    const progress = flame.life / flame.maxLife;
    const tongue = TONGUES[flame.tongue];
    const sway = Math.sin(state.tick * 0.07 + tongue.phase) * 10 * progress;
    const axis = place.x + (tongue.offset * TONGUE_SPREAD + sway) * place.scale + wind * progress * 14;
    flame.x += flame.vx + (axis - flame.x) * (0.02 + progress * 0.08);
    flame.vy *= 1.006;
    flame.y += flame.vy;
  });

  state.sparks.forEach((spark) => {
    spark.life++;
    spark.vx += Math.sin(spark.life * 0.08 + spark.maxLife) * 0.05 + wind * 0.01;
    spark.vy *= 0.985;
    spark.x += spark.vx;
    spark.y += spark.vy;
  });

  state.smoke.forEach((puff) => {
    puff.life++;
    puff.x += puff.vx + wind * 0.6;
    puff.y += puff.vy;
  });

  state.flames = state.flames.filter((flame) => flame.life < flame.maxLife);
  state.sparks = state.sparks.filter((spark) => spark.life < spark.maxLife);
  state.smoke = state.smoke.filter((puff) => puff.life < puff.maxLife);
};

// Ореол в воздухе плюс сплюснутое пятно света на земле прямо у огня. Свет на деревьях
// и поляне даёт отдельный слой (campfireLight).
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

const pickFlameSprite = (progress: number, sprites: IFireSprites) => {
  if (progress < 0.05) return sprites.core;
  if (progress < 0.32) return sprites.hot;
  return progress < 0.7 ? sprites.mid : sprites.outer;
};

const drawSprite = (ctx: CanvasRenderingContext2D, sprite: HTMLCanvasElement, x: number, y: number, size: number) => {
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
};

// Режим lighter складывает яркость перекрывающихся частиц — центр огня выгорает до белого.
export const drawFire = (
  ctx: CanvasRenderingContext2D,
  state: IFireState,
  sprites: IFireSprites,
  place: IFirePlace,
  flicker: number,
) => {
  state.smoke.forEach((puff) => {
    const progress = puff.life / puff.maxLife;
    ctx.globalAlpha = Math.sin(progress * Math.PI) * SMOKE_ALPHA;
    drawSprite(ctx, sprites.smoke, puff.x, puff.y, puff.size * (1 + progress * 2.5));
  });

  ctx.globalCompositeOperation = "lighter";

  ctx.globalAlpha = 0.12 * flicker;
  drawSprite(ctx, sprites.hot, place.x, place.y - 8 * place.scale, 48 * place.scale);

  state.flames.forEach((flame) => {
    const progress = flame.life / flame.maxLife;
    const fadeIn = Math.min(1, flame.life / 4);
    ctx.globalAlpha = Math.pow(1 - progress, 1.1) * 0.24 * fadeIn;
    const size = flame.size * (1 - progress * 0.75);
    const width = size * FLAME_STRETCH.x;
    const height = size * FLAME_STRETCH.y;
    ctx.drawImage(pickFlameSprite(progress, sprites), flame.x - width / 2, flame.y - height / 2, width, height);
  });

  state.sparks.forEach((spark) => {
    const progress = spark.life / spark.maxLife;
    ctx.globalAlpha = (1 - progress) * (0.55 + Math.random() * 0.45);
    drawSprite(ctx, sprites.spark, spark.x, spark.y, spark.size * 3);
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};
