export type TWatchVariant = "classic" | "diver" | "minimal" | "chrono";

export interface IWatchVariantOption {
  key: TWatchVariant;
  label: string;
  hint: string;
}

export const WATCH_VARIANTS: IWatchVariantOption[] = [
  { key: "classic", label: "Классика", hint: "Золото, кожаный ремешок, римские цифры" },
  { key: "diver", label: "Дайвер", hint: "Сталь, браслет, светящиеся метки и безель" },
  { key: "minimal", label: "Минимал", hint: "Тонкий корпус, только метки, сетчатый ремешок" },
  { key: "chrono", label: "Хронограф", hint: "Малые циферблаты и кнопки хронографа" },
];

export const DEFAULT_WATCH_VARIANT: TWatchVariant = "classic";

export const STORAGE_WATCH_VARIANT_KEY = "desktop_mode_watch_variant";

export const WATCH_SWITCHER_LABEL = "Вид часов";

// Геометрия в единицах viewBox: часы вертикальные, ремешок уходит за верх и низ.
export const VIEW_W = 320;
export const VIEW_H = 600;
export const CX = VIEW_W / 2;
export const CY = VIEW_H / 2;

// Малые циферблаты хронографа: 24-часовой слева, 30-минутный счётчик справа.
export const SUBDIAL_OFFSET = 40;
export const SUBDIAL_RADIUS = 21;

export const polar = (radius: number, deg: number, cx = CX, cy = CY) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

export const isWatchVariant = (value: unknown): value is TWatchVariant =>
  WATCH_VARIANTS.some((variant) => variant.key === value);
