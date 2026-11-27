import { SNOW_DENSITY_PX, SNOW_MAX_FLAKES } from "../model";

interface IFlake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  phase: number;
  alpha: number;
}

const createFlake = (width: number, height: number, isInitial: boolean): IFlake => {
  const radius = 1 + Math.random() * 2.6;
  return {
    x: Math.random() * width,
    y: isInitial ? Math.random() * height : -radius * 2,
    radius,
    // Крупные снежинки падают быстрее — так снег выглядит объёмным.
    speed: 0.35 + radius * 0.28 + Math.random() * 0.3,
    drift: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.45 + Math.random() * 0.5,
  };
};

/**
 * Запускает снегопад на canvas и возвращает функцию остановки.
 * Цвет передаётся функцией, чтобы смена темы не перезапускала анимацию.
 */
export const startSnowfall = (canvas: HTMLCanvasElement, getColor: () => string) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  let width = 0;
  let height = 0;
  let flakes: IFlake[] = [];
  let frameId = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(SNOW_MAX_FLAKES, Math.round((width * height) / SNOW_DENSITY_PX));
    flakes = Array.from({ length: count }, (_, i) => flakes[i] ?? createFlake(width, height, true));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getColor();

    for (let i = 0; i < flakes.length; i++) {
      const flake = flakes[i];
      flake.phase += 0.01;
      flake.y += flake.speed;
      flake.x += Math.sin(flake.phase) * flake.drift;

      if (flake.y > height + flake.radius) flakes[i] = createFlake(width, height, false);
      if (flake.x > width + 4) flake.x = -4;
      if (flake.x < -4) flake.x = width + 4;

      ctx.globalAlpha = flake.alpha;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    frameId = requestAnimationFrame(draw);
  };

  // На скрытой вкладке кадры не нужны: останавливаем цикл полностью.
  const handleVisibility = () => {
    cancelAnimationFrame(frameId);
    if (!document.hidden) frameId = requestAnimationFrame(draw);
  };

  resize();
  frameId = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
};
