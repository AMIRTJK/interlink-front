import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  createMicroParticles,
  drawMicroParticles,
  stepMicroParticles,
  type IPointerState,
} from "../lib/microParticles";
import { createParticleSprites } from "../lib/microParticleSprites";

// Выше 2x разница на стеклянных сферах не видна, а кадр заметно дорожает.
const MAX_PIXEL_RATIO = 2;
const FRAME_MS = 1000 / 60;
const MAX_DT = 3;
const PARALLAX_EASING = 0.04;

/** Прозрачный интерактивный слой стеклянных микросфер, боке и пыли поверх фона «Частицы». */
export const ParticlesLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const isReducedMotion = prefersReducedMotion();
    const sprites = createParticleSprites();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particles = createMicroParticles(1, 1);
    let parallaxX = 0;
    let parallaxY = 0;
    let lastTime = 0;
    let frameId = 0;

    const pointer: IPointerState = { x: -1000, y: -1000, normX: 0, normY: 0, isActive: false };

    const drawFrame = () => {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawMicroParticles(ctx, particles, sprites, parallaxX, parallaxY);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      particles = createMicroParticles(width, height);
      if (isReducedMotion) drawFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.normX = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.normY = (event.clientY / Math.max(height, 1) - 0.5) * 2;
      pointer.isActive = true;
    };

    const handlePointerLeave = () => {
      pointer.isActive = false;
      pointer.normX = 0;
      pointer.normY = 0;
    };

    const loop = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / FRAME_MS, MAX_DT) : 1;
      lastTime = time;
      parallaxX += (pointer.normX - parallaxX) * PARALLAX_EASING;
      parallaxY += (pointer.normY - parallaxY) * PARALLAX_EASING;
      stepMicroParticles(particles, width, height, pointer, dt);
      drawFrame();
      frameId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    if (!isReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block w-full h-full pointer-events-none" />;
};
