/**
 * Детерминированный генератор (mulberry32): статичные части canvas-сцен после
 * ресайза перерисовываются с теми же деревьями, камнями и звёздами на местах.
 */
export const createSeededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
