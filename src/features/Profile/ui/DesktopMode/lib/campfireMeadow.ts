import { createSeededRandom } from "./createSeededRandom";

interface IFogPuff {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
}

export interface IMeadow {
  width: number;
  fog: IFogPuff[];
  fogSprite: HTMLCanvasElement;
}

// Верх поляны — доля высоты экрана, как в campfireScene.
const MEADOW_TOP = 0.76;
const FOG_PUFFS = 14;
const SPRITE_SIZE = 64;

const createSprite = (stops: Array<[number, string]>): HTMLCanvasElement => {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const center = SPRITE_SIZE / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
};

export const createMeadow = (width: number, height: number): IMeadow => {
  const random = createSeededRandom(131);
  const meadowTop = height * MEADOW_TOP;
  const meadowDepth = height - meadowTop;

  const fog = Array.from({ length: FOG_PUFFS }, () => {
    const nearness = random();
    return {
      x: random() * width,
      y: meadowTop + meadowDepth * (0.05 + nearness * 0.6),
      radius: width * (0.12 + random() * 0.12) * (0.7 + nearness * 0.6),
      speed: (0.08 + random() * 0.12) * (random() < 0.5 ? -1 : 1),
      alpha: 0.05 + random() * 0.05,
    };
  });

  return {
    width,
    fog,
    fogSprite: createSprite([
      [0, "rgba(196, 200, 255, 1)"],
      [0.5, "rgba(196, 200, 255, 0.45)"],
      [1, "rgba(196, 200, 255, 0)"],
    ]),
  };
};

// Низкий туман: широкие сплюснутые пятна медленно дрейфуют вдоль поляны и
// заходят с другого края, когда уплывают за экран.
export const drawMeadowFog = (ctx: CanvasRenderingContext2D, meadow: IMeadow, time: number) => {
  meadow.fog.forEach((puff) => {
    const span = meadow.width + puff.radius * 2;
    const x = ((((puff.x + puff.speed * time * 0.06) % span) + span) % span) - puff.radius;
    ctx.globalAlpha = puff.alpha;
    ctx.drawImage(meadow.fogSprite, x - puff.radius, puff.y - puff.radius * 0.18, puff.radius * 2, puff.radius * 0.36);
  });
  ctx.globalAlpha = 1;
};
