export type TParticleKind = "moteCool" | "moteWarm" | "glassCool" | "glassWarm" | "bokehCool" | "bokehWarm";

export type TParticleSprites = Record<TParticleKind, HTMLCanvasElement>;

const GLASS_SPRITE_SIZE = 128;
const MOTE_SPRITE_SIZE = 32;

const createGlassSprite = (isWarm: boolean): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = GLASS_SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const c = GLASS_SPRITE_SIZE / 2;
  const r = GLASS_SPRITE_SIZE * 0.35;

  if (isWarm) {
    const halo = ctx.createRadialGradient(c, c, r * 0.6, c, c, c);
    halo.addColorStop(0, "rgba(251, 185, 72, 0.36)");
    halo.addColorStop(0.55, "rgba(245, 158, 45, 0.12)");
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, GLASS_SPRITE_SIZE, GLASS_SPRITE_SIZE);
  }

  // Прозрачное тело сферы с эффектом Френеля: середина чистая, кромка светлее.
  const body = ctx.createRadialGradient(c, c, r * 0.1, c, c, r);
  if (isWarm) {
    body.addColorStop(0, "rgba(130, 68, 14, 0.22)");
    body.addColorStop(0.65, "rgba(245, 168, 52, 0.45)");
    body.addColorStop(0.92, "rgba(255, 228, 160, 0.85)");
    body.addColorStop(1, "rgba(255, 220, 140, 0)");
  } else {
    body.addColorStop(0, "rgba(12, 28, 54, 0.18)");
    body.addColorStop(0.62, "rgba(125, 185, 225, 0.22)");
    body.addColorStop(0.9, "rgba(210, 240, 255, 0.72)");
    body.addColorStop(1, "rgba(210, 240, 255, 0)");
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

  // Внутренний рефлекс (каустика) на противоположной стороне сферы.
  const caustic = ctx.createRadialGradient(c + r * 0.32, c + r * 0.34, 0, c + r * 0.32, c + r * 0.34, r * 0.52);
  caustic.addColorStop(0, isWarm ? "rgba(255, 210, 115, 0.65)" : "rgba(155, 222, 255, 0.48)");
  caustic.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = caustic;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

  // Чёткий верхний блик на стекле.
  const glint = ctx.createRadialGradient(c - r * 0.34, c - r * 0.36, 0, c - r * 0.34, c - r * 0.36, r * 0.42);
  glint.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  glint.addColorStop(0.35, isWarm ? "rgba(255, 240, 200, 0.55)" : "rgba(225, 248, 255, 0.5)");
  glint.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glint;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isWarm ? "rgba(255, 232, 175, 0.68)" : "rgba(220, 244, 255, 0.55)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(c, c, r - 0.7, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
};

const createBokehSprite = (isWarm: boolean): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = GLASS_SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const c = GLASS_SPRITE_SIZE / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  if (isWarm) {
    grad.addColorStop(0, "rgba(245, 175, 68, 0.2)");
    grad.addColorStop(0.55, "rgba(255, 208, 120, 0.42)");
    grad.addColorStop(0.76, "rgba(255, 224, 155, 0.24)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  } else {
    grad.addColorStop(0, "rgba(110, 168, 212, 0.16)");
    grad.addColorStop(0.58, "rgba(180, 224, 248, 0.38)");
    grad.addColorStop(0.78, "rgba(215, 242, 255, 0.2)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GLASS_SPRITE_SIZE, GLASS_SPRITE_SIZE);

  // Мягкий размытый блик сверху слева, чтобы боке оставалось стеклянным, а не плоским.
  const sheen = ctx.createRadialGradient(c * 0.72, c * 0.72, 0, c * 0.72, c * 0.72, c * 0.48);
  sheen.addColorStop(0, isWarm ? "rgba(255, 242, 205, 0.42)" : "rgba(235, 250, 255, 0.38)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, GLASS_SPRITE_SIZE, GLASS_SPRITE_SIZE);

  return canvas;
};

const createMoteSprite = (isWarm: boolean): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = MOTE_SPRITE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const c = MOTE_SPRITE_SIZE / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.28, isWarm ? "rgba(255, 212, 128, 0.85)" : "rgba(198, 236, 255, 0.85)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, MOTE_SPRITE_SIZE, MOTE_SPRITE_SIZE);
  return canvas;
};

/** Пререндер оптических спрайтов стеклянных сфер, боке и пыли один раз при старте сцены. */
export const createParticleSprites = (): TParticleSprites => ({
  moteCool: createMoteSprite(false),
  moteWarm: createMoteSprite(true),
  glassCool: createGlassSprite(false),
  glassWarm: createGlassSprite(true),
  bokehCool: createBokehSprite(false),
  bokehWarm: createBokehSprite(true),
});
