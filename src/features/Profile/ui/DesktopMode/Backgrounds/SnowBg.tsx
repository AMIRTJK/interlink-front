import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  SNOW_LAYERS,
  createFlakeSprite,
  createSnowflake,
  getWind,
  renderSnowBackdrop,
  type ISnowflake,
} from "../lib/snowScene";

const createFlakes = (width: number, height: number): ISnowflake[] =>
  SNOW_LAYERS.flatMap((layer) =>
    Array.from({ length: layer.count }, () => createSnowflake(layer, width, height)),
  );

export const SnowBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let backdrop = renderSnowBackdrop(width, height, isDark);
    const flakes = createFlakes(width, height);
    const flakeSprite = createFlakeSprite(false);
    const bokehSprite = createFlakeSprite(true);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      backdrop = renderSnowBackdrop(width, height, isDark);
    };

    window.addEventListener("resize", handleResize);

    const drawFrame = () => {
      ctx.drawImage(backdrop, 0, 0);

      flakes.forEach((flake) => {
        // Спрайт шире самой снежинки: края градиента дают мягкое свечение вокруг.
        const size = flake.radius * (flake.layer.isBokeh ? 2.4 : 3.2);
        ctx.globalAlpha = flake.opacity;
        ctx.drawImage(
          flake.layer.isBokeh ? bokehSprite : flakeSprite,
          flake.x - size / 2,
          flake.y - size / 2,
          size,
          size,
        );
      });
      ctx.globalAlpha = 1;
    };

    const moveFlakes = (time: number) => {
      const wind = getWind(time);
      flakes.forEach((flake, index) => {
        flake.phase += 0.012;
        flake.y += flake.speed;
        flake.x += wind * flake.layer.windFactor + Math.sin(flake.phase) * flake.sway;

        const margin = flake.radius * 4;
        if (flake.y > height + margin) {
          flakes[index] = createSnowflake(flake.layer, width, height, true);
        } else if (flake.x > width + margin) {
          flake.x = -margin;
        } else if (flake.x < -margin) {
          flake.x = width + margin;
        }
      });
    };

    const loop = (time: number) => {
      drawFrame();
      moveFlakes(time);
      animationFrameId = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion()) drawFrame();
    else animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
};
