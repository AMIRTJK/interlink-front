// Диалог «Абзац», вкладка «Отступы и интервалы» — модель настроек одного абзаца.
// Единицы измерения повторяют Word: отступы в сантиметрах, интервалы в пунктах,
// множитель междустрочного интервала — безразмерное число.

export type TParagraphAlign = "left" | "center" | "right" | "justify";

/** Уровень структуры документа: основной текст либо заголовок h1…h6. */
export type TParagraphLevel = "body" | "1" | "2" | "3" | "4" | "5" | "6";

export type TFirstLineMode = "none" | "indent" | "hanging";

export type TLineSpacingMode =
  | "single"
  | "onehalf"
  | "double"
  | "atLeast"
  | "exactly"
  | "multiple";

export interface IParagraphFormat {
  align: TParagraphAlign;
  level: TParagraphLevel;
  /** Отступ слева, см */
  indentLeft: number;
  /** Отступ справа, см */
  indentRight: number;
  firstLine: TFirstLineMode;
  /** Величина отступа/выступа первой строки, см */
  firstLineBy: number;
  /** Интервал перед абзацем, пт */
  spaceBefore: number;
  /** Интервал после абзаца, пт */
  spaceAfter: number;
  lineMode: TLineSpacingMode;
  /** Значение междустрочного: пт для «Минимум»/«Точно», множитель для «Множитель» */
  lineValue: number;
  /** Не добавлять интервал между абзацами одного стиля */
  contextualSpacing: boolean;
}

// Холст редактора считает в CSS-пикселях при 96 DPI — те же коэффициенты,
// что и при импорте Word (см. lib/utils.ts).
export const PX_PER_CM = 96 / 2.54;
export const PX_PER_PT = 96 / 72;

/** Признак «не добавлять интервал между абзацами одного стиля» в разметке письма. */
export const CONTEXTUAL_SPACING_ATTR = "data-contextual-spacing";

// Базовый междустрочный интервал холста (EditorSurface: lineHeight 1.8).
export const BASE_LINE_HEIGHT = 1.8;

export const DEFAULT_PARAGRAPH_FORMAT: IParagraphFormat = {
  align: "left",
  level: "body",
  indentLeft: 0,
  indentRight: 0,
  firstLine: "none",
  firstLineBy: 1.25,
  spaceBefore: 0,
  spaceAfter: 0,
  lineMode: "multiple",
  lineValue: BASE_LINE_HEIGHT,
  contextualSpacing: false,
};

export const ALIGN_OPTIONS: { value: TParagraphAlign; label: string }[] = [
  { value: "left", label: "По левому краю" },
  { value: "center", label: "По центру" },
  { value: "right", label: "По правому краю" },
  { value: "justify", label: "По ширине" },
];

// Уровень задаёт тег заголовка и тем самым структуру в области навигации —
// ровно как уровень структуры Word питает его панель навигации.
export const LEVEL_OPTIONS: { value: TParagraphLevel; label: string }[] = [
  { value: "body", label: "Основной текст" },
  { value: "1", label: "Уровень 1" },
  { value: "2", label: "Уровень 2" },
  { value: "3", label: "Уровень 3" },
  { value: "4", label: "Уровень 4" },
  { value: "5", label: "Уровень 5" },
  { value: "6", label: "Уровень 6" },
];

export const FIRST_LINE_OPTIONS: { value: TFirstLineMode; label: string }[] = [
  { value: "none", label: "(нет)" },
  { value: "indent", label: "Отступ" },
  { value: "hanging", label: "Выступ" },
];

export const LINE_SPACING_OPTIONS: {
  value: TLineSpacingMode;
  label: string;
}[] = [
  { value: "single", label: "Одинарный" },
  { value: "onehalf", label: "1,5 строки" },
  { value: "double", label: "Двойной" },
  { value: "atLeast", label: "Минимум" },
  { value: "exactly", label: "Точно" },
  { value: "multiple", label: "Множитель" },
];

/** Режимы междустрочного интервала, у которых поле «значение» активно. */
export const LINE_VALUE_MODES = new Set<TLineSpacingMode>([
  "atLeast",
  "exactly",
  "multiple",
]);

// Шаги счётчиков как в диалоге Word.
export const INDENT_STEP_CM = 0.25;
export const SPACING_STEP_PT = 2;
export const LINE_PT_STEP = 0.5;
export const LINE_MULTIPLE_STEP = 0.01;

export const MAX_INDENT_CM = 55;
export const MAX_SPACING_PT = 1584;
export const MAX_LINE_PT = 1584;
export const MAX_LINE_MULTIPLE = 132;

/** Число в русской записи, без хвостовых нулей: 1.25 → «1,25», 8 → «8». */
export const formatNum = (value: number, decimals: number): string =>
  value
    .toFixed(decimals)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "")
    .replace(".", ",");

/** Разбор пользовательского ввода: запятая как разделитель, мусор → null. */
export const parseNum = (text: string): number | null => {
  const normalized = text.replace(",", ".").replace(/\s|см|пт/gi, "").trim();
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};
