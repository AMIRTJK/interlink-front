import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { createSnow, drawSnow, stepSnow } from "../lib/snowfall";

// Выше 2x разница на снежинках не видна, а кадр заметно дорожает.
const MAX_PIXEL_RATIO = 2;
const POINTER_EASING = 0.04;

/** Прозрачный слой падающего снега поверх фона сцены: тот же снег, что в «Новом годе». */
export const SnowfallLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const isReducedMotion = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let snow = createSnow(1, 1);
    let pointerX = 0;
    let pointerTarget = 0;
    let frameId = 0;

    const drawFrame = () => {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawSnow(ctx, snow, pointerX);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      snow = createSnow(width, height);
      if (isReducedMotion) drawFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTarget = (event.clientX / Math.max(width, 1) - 0.5) * 2;
    };

    const loop = () => {
      pointerX += (pointerTarget - pointerX) * POINTER_EASING;
      stepSnow(snow, width, height);
      drawFrame();
      frameId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    if (!isReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove);
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block w-full h-full pointer-events-none" />;
};
