import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import {
  getFirePlace,
  renderCampfireBackdrop,
  type IFireBounds,
  type IFirePlace,
} from "../lib/campfireScene";
import { LOCK_ANCHOR_SELECTOR, LOCK_FOOTER_SELECTOR } from "../model";
import { renderFirePitLayer } from "../lib/campfirePit";
import { drawCenteredLayer, type ICenteredLayer } from "../lib/campfireLayer";
import { getFirelightAlpha, renderFirelightLayer } from "../lib/campfireLight";
import { createMeadow, drawMeadowFog, type IMeadow } from "../lib/campfireMeadow";
import {
  createFireSprites,
  createFireState,
  drawFire,
  drawFireGlow,
  getFlicker,
  stepFire,
} from "../lib/campfireFire";

// Сколько шагов прогнать до статичного кадра, чтобы огонь успел разгореться.
const WARMUP_STEPS = 100;
// Выше 2x разница не видна, а частиц с режимом lighter на кадр становится заметно дороже.
const MAX_PIXEL_RATIO = 2;
// Раскладку над огнём перечитываем раз в несколько кадров: карточка появляется,
// прячется и меняет высоту (ошибка пароля), а отдельного события на это нет.
const MEASURE_EVERY_FRAMES = 12;
const REDUCED_MOTION_MEASURE_MS = 500;
// Доля пути к новому месту за кадр — костёр плавно отступает, когда появляется форма.
const PLACE_EASING = 0.08;
// Фиксированный шаг симуляции физики огня (60 шагов в секунду), независимый от герцовки экрана.
const SIMULATION_STEP_MS = 1000 / 60;
const MAX_ACCUMULATED_MS = 100;

const measureFireBounds = (): IFireBounds | null => {
  const anchor = document.querySelector(LOCK_ANCHOR_SELECTOR);
  const footer = document.querySelector(LOCK_FOOTER_SELECTOR);
  if (!anchor || !footer) return null;
  return {
    anchorBottom: anchor.getBoundingClientRect().bottom,
    footerTop: footer.getBoundingClientRect().top,
  };
};

const isSamePlace = (a: IFirePlace, b: IFirePlace) => a.x === b.x && a.y === b.y && a.scale === b.scale;

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const CampfireBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isReducedMotion = prefersReducedMotion();
    let animationFrameId = 0;
    let measureTimer = 0;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let target = getFirePlace(1, 1, null);
    const place: IFirePlace = { ...target };
    let backdrop: HTMLCanvasElement | null = null;
    let pit: ICenteredLayer | null = null;
    let firelight: HTMLCanvasElement | null = null;
    let meadow: IMeadow | null = null;
    let fire = createFireState();
    const sprites = createFireSprites();

    // Кострище и свет рендерятся под целевое место, а во время
    // перехода слои растягиваются до текущего масштаба — перерисовывать каждый кадр незачем.
    const retarget = (): boolean => {
      const next = getFirePlace(width, height, measureFireBounds());
      if (pit && isSamePlace(next, target)) return false;
      target = next;
      pit = renderFirePitLayer(target, pixelRatio);
      firelight = renderFirelightLayer(width, height, target, pixelRatio);
      return true;
    };

    const snapToTarget = () => Object.assign(place, target);

    const easeToTarget = () => {
      place.x += (target.x - place.x) * PLACE_EASING;
      place.y += (target.y - place.y) * PLACE_EASING;
      place.scale += (target.scale - place.scale) * PLACE_EASING;
    };

    const drawFrame = (time: number) => {
      const flicker = getFlicker(time);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (backdrop) ctx.drawImage(backdrop, 0, 0);
      if (firelight) {
        ctx.globalAlpha = getFirelightAlpha(flicker);
        ctx.drawImage(firelight, 0, 0);
        ctx.globalAlpha = 1;
      }
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (meadow) drawMeadowFog(ctx, meadow, time);
      drawFireGlow(ctx, place, flicker);
      if (pit) drawCenteredLayer(ctx, pit, place, target.scale);
      drawFire(ctx, fire, sprites, place, flicker);
    };

    // Без анимации огонь «разгорается» заранее и рисуется одним кадром.
    const drawStill = () => {
      fire = createFireState();
      for (let i = 0; i < WARMUP_STEPS; i++) stepFire(fire, place);
      drawFrame(0);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      backdrop = renderCampfireBackdrop(width, height, pixelRatio);
      meadow = createMeadow(width, height);
      pit = null;
      retarget();
      snapToTarget();
      if (isReducedMotion) drawStill();
    };

    let lastTime = 0;
    let accumulatedTime = 0;

    const loop = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min(time - lastTime, MAX_ACCUMULATED_MS);
      lastTime = time;
      accumulatedTime += dt;

      while (accumulatedTime >= SIMULATION_STEP_MS) {
        frame++;
        if (frame % MEASURE_EVERY_FRAMES === 0) retarget();
        easeToTarget();
        stepFire(fire, place);
        accumulatedTime -= SIMULATION_STEP_MS;
      }

      drawFrame(time);
      animationFrameId = requestAnimationFrame(loop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (isReducedMotion) {
      measureTimer = window.setInterval(() => {
        if (!retarget()) return;
        snapToTarget();
        drawStill();
      }, REDUCED_MOTION_MEASURE_MS);
    } else {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearInterval(measureTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />;
};
