import type { TParticleKind, TParticleSprites } from "./microParticleSprites";

interface IMicroParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  phase: number;
  twinkleSpeed: number;
  parallax: number;
  reactsToPointer: boolean;
  kind: TParticleKind;
}

export interface IPointerState {
  x: number;
  y: number;
  /** Нормализованное смещение курсора [-1..1] для лёгкого параллакса ближнего боке. */
  normX: number;
  normY: number;
  isActive: boolean;
}

// Радиус отталкивания частиц от курсора, как в исходной сцене «Частицы».
const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 0.28;
const VELOCITY_DAMPING = 0.96;

const LAYER_CONFIGS = [
  // Мелкая мерцающая кристаллическая пыль.
  {
    density: 28000,
    minCount: 28,
    maxCount: 68,
    size: [3, 7],
    speed: [0.12, 0.3],
    alpha: [0.35, 0.85],
    twinkle: [0.012, 0.03],
    parallax: 8,
    warmChance: 0.2,
    coolKind: "moteCool" as const,
    warmKind: "moteWarm" as const,
    reactsToPointer: true,
  },
  // Чёткие полупрозрачные стеклянные и золотые микросферы среднего плана.
  {
    density: 95000,
    minCount: 12,
    maxCount: 24,
    size: [12, 28],
    speed: [0.18, 0.42],
    alpha: [0.45, 0.82],
    twinkle: [0.005, 0.012],
    parallax: 18,
    warmChance: 0.22,
    coolKind: "glassCool" as const,
    warmKind: "glassWarm" as const,
    reactsToPointer: true,
  },
  // Крупные размытые сферы-боке ближнего плана для глубины макросъёмки.
  {
    density: 260000,
    minCount: 4,
    maxCount: 8,
    size: [52, 92],
    speed: [0.14, 0.32],
    alpha: [0.18, 0.34],
    twinkle: [0.004, 0.009],
    parallax: 34,
    warmChance: 0.25,
    coolKind: "bokehCool" as const,
    warmKind: "bokehWarm" as const,
    reactsToPointer: false,
  },
] as const;

const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0]);

export const createMicroParticles = (width: number, height: number): IMicroParticle[] => {
  const particles: IMicroParticle[] = [];

  LAYER_CONFIGS.forEach((layer) => {
    const rawCount = Math.round((width * height) / layer.density);
    const count = Math.max(layer.minCount, Math.min(layer.maxCount, rawCount));

    for (let i = 0; i < count; i++) {
      // Слабое общее течение вверх-вправо повторяет направление потока сфер на фоне.
      const speed = between(layer.speed);
      const angle = -0.35 + (Math.random() - 0.5) * 1.1;
      const baseVx = Math.cos(angle) * speed;
      const baseVy = Math.sin(angle) * speed;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: between(layer.size),
        alpha: between(layer.alpha),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: between(layer.twinkle),
        parallax: layer.parallax,
        reactsToPointer: layer.reactsToPointer,
        kind: Math.random() < layer.warmChance ? layer.warmKind : layer.coolKind,
      });
    }
  });

  return particles;
};

export const stepMicroParticles = (
  particles: IMicroParticle[],
  width: number,
  height: number,
  pointer: IPointerState,
  dt: number,
) => {
  const damping = Math.pow(VELOCITY_DAMPING, dt);

  particles.forEach((p) => {
    p.phase += p.twinkleSpeed * dt;

    if (p.reactsToPointer && pointer.isActive) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 0.01 && distSq < REPEL_RADIUS * REPEL_RADIUS) {
        const dist = Math.sqrt(distSq);
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH * dt;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    // Плавно возвращаем скорость частицы к естественному течению после отталкивания.
    p.vx = p.baseVx + (p.vx - p.baseVx) * damping;
    p.vy = p.baseVy + (p.vy - p.baseVy) * damping;

    p.x += (p.vx + Math.cos(p.phase * 0.7) * 0.06) * dt;
    p.y += (p.vy + Math.sin(p.phase) * 0.08) * dt;

    const pad = p.size;
    if (p.x > width + pad) p.x = -pad;
    if (p.x < -pad) p.x = width + pad;
    if (p.y > height + pad) p.y = -pad;
    if (p.y < -pad) p.y = height + pad;
  });
};

export const drawMicroParticles = (
  ctx: CanvasRenderingContext2D,
  particles: IMicroParticle[],
  sprites: TParticleSprites,
  parallaxX: number,
  parallaxY: number,
) => {
  particles.forEach((p) => {
    const pulse = 0.72 + 0.28 * Math.sin(p.phase);
    const half = p.size / 2;
    const drawX = p.x + parallaxX * p.parallax - half;
    const drawY = p.y + parallaxY * p.parallax - half;
    ctx.globalAlpha = p.alpha * pulse;
    ctx.drawImage(sprites[p.kind], drawX, drawY, p.size, p.size);
  });
  ctx.globalAlpha = 1;
};
