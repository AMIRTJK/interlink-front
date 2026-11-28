interface IRaindrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  lineWidth: number;
  /** Высота, на которой капля касается мокрой площади; для ближнего слоя — ниже экрана. */
  landY: number;
  canSplash: boolean;
}

interface ISplash {
  x: number;
  y: number;
  r: number;
  maxR: number;
  speed: number;
  initialAlpha: number;
}

export interface IRainState {
  drops: IRaindrop[];
  splashes: ISplash[];
}

// Дальние и ближние капли: длина, скорость, толщина, плотность и высота «земли» (мокрой площади).
const RAIN_LAYERS = [
  { len: [10, 18], speed: [10, 15], alpha: [0.09, 0.21], lineWidth: 0.9, density: 24000, canSplash: true },
  { len: [18, 30], speed: [16, 23], alpha: [0.16, 0.34], lineWidth: 1.25, density: 55000, canSplash: false },
] as const;

const RAIN_COLOR = "#bae6fd";
// Лёгкий наклон дождя по ветру (доля смещения по X от пути по Y).
const WIND_SLANT = 0.07;
// Зона мокрой каменной площади в нижней части кадра, где рождаются круги на воде.
const PLAZA_TOP_RATIO = 0.66;
const PLAZA_BOTTOM_RATIO = 0.98;
const RIPPLE_FLATTEN = 0.28;
const SPLASH_CHANCE = 0.55;
const MAX_SPLASHES = 45;

const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0]);

const pickLandY = (height: number, canSplash: boolean) =>
  canSplash
    ? height * (PLAZA_TOP_RATIO + Math.random() * (PLAZA_BOTTOM_RATIO - PLAZA_TOP_RATIO))
    : height + 40;

const resetDrop = (drop: IRaindrop, width: number, height: number, initial: boolean) => {
  drop.landY = pickLandY(height, drop.canSplash);
  drop.x = Math.random() * (width + 80) - 40;
  drop.y = initial ? Math.random() * drop.landY - drop.len : -drop.len - Math.random() * 80;
};

export const createRain = (width: number, height: number): IRainState => {
  const drops: IRaindrop[] = [];

  RAIN_LAYERS.forEach((layer) => {
    const count = Math.max(12, Math.round((width * height) / layer.density));
    for (let i = 0; i < count; i++) {
      const drop: IRaindrop = {
        x: 0,
        y: 0,
        len: between(layer.len),
        speed: between(layer.speed),
        alpha: between(layer.alpha),
        lineWidth: layer.lineWidth,
        landY: height,
        canSplash: layer.canSplash,
      };
      resetDrop(drop, width, height, true);
      drops.push(drop);
    }
  });

  return { drops, splashes: [] };
};

export const stepRain = (state: IRainState, width: number, height: number, dt: number) => {
  const { drops, splashes } = state;

  drops.forEach((drop) => {
    const dy = drop.speed * dt;
    drop.y += dy;
    drop.x += dy * WIND_SLANT;

    if (drop.y >= drop.landY) {
      if (drop.canSplash && splashes.length < MAX_SPLASHES && Math.random() < SPLASH_CHANCE) {
        // Чем ближе точка падения к нижнему краю, тем крупнее круг в перспективе.
        const depth = Math.max(0, Math.min(1, (drop.landY / Math.max(height, 1) - PLAZA_TOP_RATIO) / (1 - PLAZA_TOP_RATIO)));
        const perspective = 0.45 + 0.75 * depth;
        splashes.push({
          x: drop.x,
          y: drop.landY,
          r: 1,
          maxR: (6 + Math.random() * 10) * perspective,
          speed: (0.28 + Math.random() * 0.16) * perspective,
          initialAlpha: drop.alpha * 1.4,
        });
      }
      resetDrop(drop, width, height, false);
    }
  });

  for (let i = splashes.length - 1; i >= 0; i--) {
    const splash = splashes[i];
    splash.r += splash.speed * dt;
    if (splash.r >= splash.maxR) {
      splashes.splice(i, 1);
    }
  }
};

export const drawRain = (ctx: CanvasRenderingContext2D, state: IRainState) => {
  ctx.strokeStyle = RAIN_COLOR;
  ctx.lineCap = "round";

  state.drops.forEach((drop) => {
    ctx.globalAlpha = drop.alpha;
    ctx.lineWidth = drop.lineWidth;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + drop.len * WIND_SLANT, drop.y + drop.len);
    ctx.stroke();
  });

  ctx.lineWidth = 1;
  state.splashes.forEach((splash) => {
    const life = 1 - splash.r / splash.maxR;
    ctx.globalAlpha = splash.initialAlpha * life;
    ctx.beginPath();
    ctx.ellipse(splash.x, splash.y, splash.r, splash.r * RIPPLE_FLATTEN, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
};
