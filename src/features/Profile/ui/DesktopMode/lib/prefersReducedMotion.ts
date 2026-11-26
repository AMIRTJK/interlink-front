const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Canvas-сцены читают настройку один раз при старте: при reduce рисуют статичный кадр без цикла.
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
