import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { getFirePlace, renderCampfireBackdrop } from "../lib/campfireScene";
import {
  createFireSprites,
  createFireState,
  drawFire,
  drawFireGlow,
  getFlicker,
  stepFire,
} from "../lib/campfireFire";

// Сколько шагов прогнать до статичного кадра, чтобы огонь успел разгореться.
const WARMUP_STEPS = 90;

export const CampfireBg = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let place = getFirePlace(width, height);
    let backdrop = renderCampfireBackdrop(width, height, isDark, place);
    const fire = createFireState();
    const sprites = createFireSprites();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      place = getFirePlace(width, height);
      backdrop = renderCampfireBackdrop(width, height, isDark, place);
    };

    window.addEventListener("resize", handleResize);

    const drawFrame = (time: number) => {
      ctx.drawImage(backdrop, 0, 0);
      drawFireGlow(ctx, place, getFlicker(time));
      drawFire(ctx, fire, sprites);
    };

    const loop = (time: number) => {
      stepFire(fire, place);
      drawFrame(time);
      animationFrameId = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion()) {
      for (let i = 0; i < WARMUP_STEPS; i++) stepFire(fire, place);
      drawFrame(0);
    } else {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
};
