import {
  buildDSStampSvg,
  dsStampHeightForWidth,
  generateQRMatrix,
} from "../../lib/utils";

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

interface IEmbeddedStampParams {
  width: number;
  x: number;
  y: number;
  signerName: string;
  signerInitials: string;
}

// Вшитый в тело письма штамп ЭЦП: тот же SVG, что рисует React-компонент
// <DSStamp>, но картинкой с data-URI — чтобы экранный, печатный и боковой
// штампы были идентичны, а бэкенд получил самодостаточный HTML.
export const buildEmbeddedStampHtml = ({
  width,
  x,
  y,
  signerName,
  signerInitials,
}: IEmbeddedStampParams) => {
  // Высоту всегда выводим из ширины по пропорциям макета, чтобы вшитая
  // картинка не искажалась относительно SVG (viewBox 760×333).
  const stampHeightVal = dsStampHeightForWidth(width);
  const widthStr = `${width}px`;
  const currentDate = new Date().toLocaleDateString("ru-RU");
  const certSerial = `SN-2026-${signerInitials}-84201`;
  const validUntil = "аз 20.03.2025 то 20.03.2026";

  const fullStampSvg = buildDSStampSvg({
    name: signerName,
    certSerial,
    signedAt: currentDate,
    validUntil,
  });

  const encodedSvg = btoa(unescape(encodeURIComponent(fullStampSvg)));
  const stampDataUri = `data:image/svg+xml;base64,${encodedSvg}`;

  // Использовать строго в одну строку без пробелов внутри тегов, чтобы редактор не вставил текстовые переносы
  return `<div data-signature-stamp="true" contenteditable="false" style="position:absolute;left:${x}px;top:${y}px;width:${widthStr};height:${stampHeightVal}px;max-height:${stampHeightVal}px;z-index:99;user-select:none;-webkit-user-select:none;cursor:default;overflow:hidden!important;display:block!important;line-height:0!important;padding:0!important;margin:0!important;border:none!important;"><img src="${stampDataUri}" alt="ЭЦП" style="display:block!important;width:100%!important;height:${stampHeightVal}px!important;max-height:${stampHeightVal}px!important;pointer-events:none!important;-webkit-user-drag:none!important;padding:0!important;margin:0!important;border:none!important;outline:none!important;line-height:0!important;" /></div>`;
};
