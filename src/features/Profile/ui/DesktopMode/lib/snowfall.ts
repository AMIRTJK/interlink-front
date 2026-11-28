interface IFlake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  alpha: number;
}

export interface ISnowLayer {
  flakes: IFlake[];
  /** Насколько слой смещается за курсором: ближние слои — сильнее. */
  parallax: number;
}

// Дальний, средний и ближний снег: размер, скорость, плотность и параллакс.
const SNOW_LAYERS = [
  { radius: [0.5, 1.1], speed: [0.25, 0.5], density: 9000, parallax: 6 },
  { radius: [1.1, 2], speed: [0.6, 1], density: 22000, parallax: 16 },
  { radius: [2.2, 3.6], speed: [1.2, 1.8], density: 70000, parallax: 34 },
] as const;

const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0]);

export const createSnow = (width: number, height: number): ISnowLayer[] =>
  SNOW_LAYERS.map((layer) => ({
    parallax: layer.parallax,
    flakes: Array.from({ length: Math.round((width * height) / layer.density) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: between(layer.radius),
      speed: between(layer.speed),
      phase: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.5,
    })),
  }));

export const stepSnow = (snow: ISnowLayer[], width: number, height: number) => {
  snow.forEach((layer) =>
    layer.flakes.forEach((flake) => {
      flake.phase += 0.012;
      flake.y += flake.speed;
      flake.x += Math.sin(flake.phase) * flake.speed * 0.35;
      if (flake.y > height + flake.radius) {
        flake.y = -flake.radius * 2;
        flake.x = Math.random() * width;
      }
      if (flake.x > width + 40) flake.x -= width + 80;
      if (flake.x < -40) flake.x += width + 80;
    }),
  );
};

export const drawSnow = (ctx: CanvasRenderingContext2D, snow: ISnowLayer[], pointerX: number) => {
  ctx.fillStyle = "#ffffff";
  snow.forEach((layer) => {
    const shift = pointerX * layer.parallax;
    layer.flakes.forEach((flake) => {
      ctx.globalAlpha = flake.alpha;
      ctx.beginPath();
      ctx.arc(flake.x + shift, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  ctx.globalAlpha = 1;
};
