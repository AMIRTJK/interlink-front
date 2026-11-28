import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { createRain, drawRain, stepRain } from "../lib/rainfall";

// Выше 2x разница на тонких каплях не видна, а кадр заметно дорожает.
const MAX_PIXEL_RATIO = 2;
const FRAME_MS = 1000 / 60;
// Ограничиваем шаг после возврата из фоновой вкладки, чтобы капли не прыгали пачкой.
const MAX_DT = 3;

/** Прозрачный слой падающего дождя и кругов на воде поверх фона сцены. */
export const RainfallLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const isReducedMotion = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let rain = createRain(1, 1);
    let lastTime = 0;
    let frameId = 0;

    const drawFrame = () => {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawRain(ctx, rain);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      rain = createRain(width, height);
      if (isReducedMotion) drawFrame();
    };

    const loop = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / FRAME_MS, MAX_DT) : 1;
      lastTime = time;
      stepRain(rain, width, height, dt);
      drawFrame();
      frameId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    if (!isReducedMotion) {
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block w-full h-full pointer-events-none" />;
};
