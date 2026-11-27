import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { LOCK_ANCHOR_SELECTOR, LOCK_FOOTER_SELECTOR } from "../model";
import { renderNewYearBackdrop } from "../lib/newYearBackdrop";
import { getTreePlace, renderTreeLayer, type ITreeBounds, type ITreeLayer, type ITreePlace } from "../lib/newYearTree";
import {
  createGlowSprites,
  createSnow,
  createTwinkles,
  drawSnow,
  drawTreeLayer,
  drawTreeLights,
  drawTwinkles,
  drawWarmGlow,
  stepSnow,
} from "../lib/newYearLive";
import plateSrc from "../assets/newyear-plate.webp";

// Готовый 4K-фон с ёлкой. Если убрать картинку (null), задник и ёлка рисуются кодом.
const PLATE_SRC: string | null = plateSrc;
const PLATE_SIZE = { width: 3840, height: 2144 } as const;
// Середина ёлки на картинке в долях её размера и радиус тёплого свечения в долях высоты.
const PLATE_GLOW = { x: 0.5, y: 0.66, radius: 0.24 } as const;

const MAX_PIXEL_RATIO = 2;
const MEASURE_EVERY_FRAMES = 12;
const REDUCED_MOTION_MEASURE_MS = 500;
const PLACE_EASING = 0.08;
const POINTER_EASING = 0.04;

const measureBounds = (): ITreeBounds | null => {
  const anchor = document.querySelector(LOCK_ANCHOR_SELECTOR);
  const footer = document.querySelector(LOCK_FOOTER_SELECTOR);
  if (!anchor || !footer) return null;
  return { anchorBottom: anchor.getBoundingClientRect().bottom, footerTop: footer.getBoundingClientRect().top };
};

const isSamePlace = (a: ITreePlace, b: ITreePlace) => a.x === b.x && a.baseY === b.baseY && a.height === b.height;

// Где ёлка картинки оказывается на экране: фон лежит как object-cover, прижатый к низу.
const getPlateGlow = (width: number, height: number) => {
  const scale = Math.max(width / PLATE_SIZE.width, height / PLATE_SIZE.height);
  const offsetX = (width - PLATE_SIZE.width * scale) / 2;
  const offsetY = height - PLATE_SIZE.height * scale;
  return {
    x: offsetX + PLATE_GLOW.x * PLATE_SIZE.width * scale,
    y: offsetY + PLATE_GLOW.y * PLATE_SIZE.height * scale,
    radius: PLATE_GLOW.radius * PLATE_SIZE.height * scale,
  };
};

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const NewYearBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const hasPlate = PLATE_SRC !== null;
    const isReducedMotion = prefersReducedMotion();
    const sprites = createGlowSprites();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let backdrop: HTMLCanvasElement | null = null;
    let tree: ITreeLayer | null = null;
    let target = getTreePlace(1, 1, null);
    const place: ITreePlace = { ...target };
    let snow = createSnow(1, 1);
    let twinkles = createTwinkles(1, 1);
    let pointerX = 0;
    let pointerTarget = 0;
    let frame = 0;
    let frameId = 0;
    let measureTimer = 0;

    // Ёлка картинки неподвижна: раскладку под неё перемерять не нужно.
    const retarget = (): boolean => {
      if (hasPlate) return false;
      const next = getTreePlace(width, height, measureBounds());
      if (tree && isSamePlace(next, target)) return false;
      target = next;
      tree = renderTreeLayer(target.height, pixelRatio);
      return true;
    };

    const easeToTarget = () => {
      place.x += (target.x - place.x) * PLACE_EASING;
      place.baseY += (target.baseY - place.baseY) * PLACE_EASING;
      place.height += (target.height - place.height) * PLACE_EASING;
    };

    const drawFrame = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (backdrop) ctx.drawImage(backdrop, 0, 0);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawTwinkles(ctx, twinkles, time);

      if (hasPlate) {
        const glow = getPlateGlow(width, height);
        drawWarmGlow(ctx, sprites[0], glow.x, glow.y, glow.radius, time);
      } else if (tree) {
        drawWarmGlow(ctx, sprites[0], place.x, place.baseY - place.height * 0.45, place.height * 0.8, time);
        drawTreeLayer(ctx, tree, place);
        drawTreeLights(ctx, tree, place, sprites, time);
      }

      drawSnow(ctx, snow, pointerX);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      backdrop = hasPlate ? null : renderNewYearBackdrop(width, height, pixelRatio);
      snow = createSnow(width, height);
      twinkles = createTwinkles(width, height);
      tree = null;
      retarget();
      Object.assign(place, target);
      if (isReducedMotion) drawFrame(0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTarget = (event.clientX / Math.max(width, 1) - 0.5) * 2;
    };

    const loop = (time: number) => {
      frame++;
      if (frame % MEASURE_EVERY_FRAMES === 0) retarget();
      easeToTarget();
      pointerX += (pointerTarget - pointerX) * POINTER_EASING;
      stepSnow(snow, width, height);
      drawFrame(time);
      frameId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (isReducedMotion) {
      measureTimer = window.setInterval(() => {
        if (!retarget()) return;
        Object.assign(place, target);
        drawFrame(0);
      }, REDUCED_MOTION_MEASURE_MS);
    } else {
      window.addEventListener("pointermove", handlePointerMove);
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.clearInterval(measureTimer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {PLATE_SRC && (
        <img
          src={PLATE_SRC}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 block w-full h-full object-cover object-bottom"
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </>
  );
};
