import { useEffect, useRef } from "react";
import {
  ACTIVE_HIDE_DELAY_MS,
  APP_ROOT_ID,
  MIN_THUMB_PX,
  REDUCED_MOTION_QUERY,
  STREAK_FULL_SPEED_PX,
  STREAK_RESET_MS,
} from "../model";

interface IDragState {
  pointerId: number;
  startY: number;
  startScroll: number;
}

/**
 * Связывает рельс с прокруткой окна. Положение пишем прямо в style внутри rAF,
 * а не через setState: событие scroll приходит десятки раз в секунду, и
 * ререндер на каждое — лишняя работа для элемента, у которого меняется только transform.
 */
export const usePageScrollRail = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    const streak = streakRef.current;
    const appRoot = document.getElementById(APP_ROOT_ID);
    if (!rail || !thumb || !streak || !appRoot) return;

    const doc = document.documentElement;
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let frame = 0;
    let activeTimer = 0;
    let streakTimer = 0;
    let lastScrollY = window.scrollY;
    let thumbHeight = 0;
    let drag: IDragState | null = null;

    const getMetrics = () => {
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const railHeight = rail.clientHeight;
      const proportional = railHeight * (window.innerHeight / doc.scrollHeight);
      const height = Math.min(railHeight, Math.max(MIN_THUMB_PX, proportional));
      return { maxScroll, height, travel: railHeight - height };
    };

    const render = () => {
      frame = 0;
      const { maxScroll, height, travel } = getMetrics();
      const isScrollable = maxScroll > 1;
      rail.dataset.scrollable = String(isScrollable);
      if (!isScrollable) return;

      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      if (height !== thumbHeight) {
        thumbHeight = height;
        thumb.style.height = `${height}px`;
      }
      thumb.style.transform = `translate3d(0, ${progress * travel}px, 0)`;
    };

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const activate = () => {
      rail.dataset.active = "true";
      window.clearTimeout(activeTimer);
      activeTimer = window.setTimeout(() => {
        if (!drag) rail.dataset.active = "false";
      }, ACTIVE_HIDE_DELAY_MS);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      if (delta !== 0) {
        rail.dataset.dir = delta > 0 ? "down" : "up";
        const stretch = Math.min(1, Math.abs(delta) / STREAK_FULL_SPEED_PX);
        streak.style.transform = `scaleY(${stretch})`;
        window.clearTimeout(streakTimer);
        streakTimer = window.setTimeout(() => {
          streak.style.transform = "scaleY(0)";
        }, STREAK_RESET_MS);
      }

      activate();
      scheduleRender();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const { maxScroll, travel } = getMetrics();
      if (maxScroll <= 1 || travel <= 0) return;
      event.preventDefault();

      if (event.target instanceof Node && thumb.contains(event.target)) {
        drag = { pointerId: event.pointerId, startY: event.clientY, startScroll: window.scrollY };
        rail.setPointerCapture(event.pointerId);
        rail.dataset.dragging = "true";
        activate();
        return;
      }

      const offset = event.clientY - rail.getBoundingClientRect().top - thumbHeight / 2;
      window.scrollTo({
        top: (offset / travel) * maxScroll,
        behavior: motionQuery.matches ? "auto" : "smooth",
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const { maxScroll, travel } = getMetrics();
      if (travel <= 0) return;
      window.scrollTo({ top: drag.startScroll + (event.clientY - drag.startY) * (maxScroll / travel) });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag = null;
      rail.releasePointerCapture(event.pointerId);
      rail.dataset.dragging = "false";
      activate();
    };

    // Высота документа меняется вместе с контентом, а у html/body она 100% и
    // не меняется, поэтому следим за обёртками внутри #root. Они пересоздаются
    // при смене лэйаута, отсюда MutationObserver.
    const resizeObserver = new ResizeObserver(scheduleRender);
    const observeAppChildren = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(rail);
      Array.from(appRoot.children).forEach((child) => resizeObserver.observe(child));
      scheduleRender();
    };
    const mutationObserver = new MutationObserver(observeAppChildren);
    mutationObserver.observe(appRoot, { childList: true });
    observeAppChildren();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleRender);
    rail.addEventListener("pointerdown", handlePointerDown);
    rail.addEventListener("pointermove", handlePointerMove);
    rail.addEventListener("pointerup", handlePointerUp);
    rail.addEventListener("pointercancel", handlePointerUp);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(activeTimer);
      window.clearTimeout(streakTimer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", scheduleRender);
      rail.removeEventListener("pointerdown", handlePointerDown);
      rail.removeEventListener("pointermove", handlePointerMove);
      rail.removeEventListener("pointerup", handlePointerUp);
      rail.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return { railRef, thumbRef, streakRef };
};
