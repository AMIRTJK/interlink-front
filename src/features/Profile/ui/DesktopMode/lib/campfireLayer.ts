import type { IFirePlace } from "./campfireScene";

export interface ICenteredLayer {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

/**
 * Статичный слой вокруг костра (кострище), центрированный на
 * точке огня. Рисуется один раз на место костра; пока костёр плавно меняет масштаб,
 * слой растягивается относительно этой точки, а не перерисовывается каждый кадр.
 * Размеры halfWidth/halfHeight — в единицах масштаба костра.
 */
export const renderCenteredLayer = (
  place: IFirePlace,
  pixelRatio: number,
  halfWidth: number,
  halfHeight: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): ICenteredLayer => {
  const width = halfWidth * 2 * place.scale;
  const height = halfHeight * 2 * place.scale;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * pixelRatio);
  canvas.height = Math.ceil(height * pixelRatio);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(pixelRatio, pixelRatio);
    ctx.translate(width / 2 - place.x, height / 2 - place.y);
    draw(ctx);
  }
  return { canvas, width, height };
};

export const drawCenteredLayer = (
  ctx: CanvasRenderingContext2D,
  layer: ICenteredLayer,
  place: IFirePlace,
  targetScale: number,
) => {
  const ratio = place.scale / targetScale;
  const width = layer.width * ratio;
  const height = layer.height * ratio;
  ctx.drawImage(layer.canvas, place.x - width / 2, place.y - height / 2, width, height);
};
