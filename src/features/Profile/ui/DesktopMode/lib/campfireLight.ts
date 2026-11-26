import { drawLandscape, type IFirePlace, type ILandscapePalette } from "./campfireScene";

// Тот же лес и поляна, но так, как их видно в отсвете огня: тёплые, рыжеватые.
const FIRELIGHT_PALETTE: ILandscapePalette = {
  mountains: "rgb(36, 30, 70)",
  forest: ["rgb(40, 26, 52)", "rgb(58, 30, 34)", "rgb(78, 36, 24)"],
  ground: ["rgb(120, 58, 26)", "rgb(40, 18, 10)"],
  groundSheen: "rgba(255, 170, 100, 0.25)",
  mist: null,
  frame: "rgb(30, 16, 14)",
};

// Свет падает пятном, вытянутым по горизонтали: дальше вбок по поляне, меньше вверх.
const LIGHT_RADIUS = 330;
const LIGHT_STRETCH_X = 1.6;

/**
 * Слой «освещённого» пейзажа, обрезанный радиальной маской вокруг костра.
 * Строится один раз на место костра; в каждом кадре рисуется поверх обычного
 * пейзажа с прозрачностью, которая дрожит вместе с пламенем, — деревья и земля
 * у огня мерцают тёплым светом.
 */
export const renderFirelightLayer = (
  width: number,
  height: number,
  place: IFirePlace,
  pixelRatio: number,
): HTMLCanvasElement => {
  const layer = document.createElement("canvas");
  layer.width = Math.round(width * pixelRatio);
  layer.height = Math.round(height * pixelRatio);
  const ctx = layer.getContext("2d");
  if (!ctx) return layer;
  ctx.scale(pixelRatio, pixelRatio);

  drawLandscape(ctx, width, height, FIRELIGHT_PALETTE);

  const radius = LIGHT_RADIUS * place.scale;
  // destination-in оставляет слой только под маской; всё вне прямоугольника маски
  // по спецификации canvas тоже стирается.
  ctx.globalCompositeOperation = "destination-in";
  ctx.save();
  ctx.translate(place.x, place.y - 10 * place.scale);
  ctx.scale(LIGHT_STRETCH_X, 1);
  const mask = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  mask.addColorStop(0, "rgba(0, 0, 0, 1)");
  mask.addColorStop(0.35, "rgba(0, 0, 0, 0.6)");
  mask.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = mask;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  ctx.restore();
  return layer;
};

// Свет дышит вместе с пламенем, но сильнее, чем сам ореол: так мерцание заметно на деревьях.
export const getFirelightAlpha = (flicker: number) => Math.min(1, 0.55 * Math.pow(flicker, 4));
