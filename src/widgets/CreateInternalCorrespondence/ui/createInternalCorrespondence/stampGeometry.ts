import { dsStampHeightForWidth, generateQRMatrix } from "../../lib/utils";

// Ширина штампа ЭЦП на листе А4 по умолчанию (≈47% ширины полосы) и высота,
// рассчитанная по пропорциям макета. Один источник правды для плейсхолдера,
// вшитой картинки и границ перетаскивания.
export const DS_STAMP_DEFAULT_WIDTH = 377;
export const DS_STAMP_DEFAULT_HEIGHT = dsStampHeightForWidth(DS_STAMP_DEFAULT_WIDTH);
// Границы масштабирования штампа ЭЦП при размещении. Высота всегда выводится из
// ширины по пропорциям макета (dsStampHeightForWidth), так что достаточно
// ограничить только ширину. Дефолт (377) остаётся внутри диапазона — размер «по
// умолчанию» не меняется.
export const DS_STAMP_MIN_WIDTH = 160;
export const DS_STAMP_MAX_WIDTH = 760;

// Генерация QR-кода в виде HTML-строки, идентичного компоненту <QRCodeSVG />,
// чтобы печать ЭЦП в редакторе совпадала с блоком "Подписывающий".
export function buildStampQRSvg(value: string, size = 52) {
  const GRID = 21;
  const matrix = generateQRMatrix(value, GRID);
  const cellSize = size / GRID;
  let rects = "";
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (matrix[row][col]) {
        rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e3a8a"/>`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;flex-shrink:0;"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`;
}
