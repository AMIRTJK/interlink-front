export type TNewYearEffect = "snow" | "garland" | "countdown" | "winterBg";

export interface INewYearSettings {
  isEnabled: boolean;
  effects: Record<TNewYearEffect, boolean>;
}

export interface INewYearEffectOption {
  key: TNewYearEffect;
  label: string;
  hint: string;
}

export const NEW_YEAR_STORAGE_KEY = "newYearMode";
export const NEW_YEAR_CHANGE_EVENT = "newyearmodechange";

// Режим выключен, пока пользователь сам его не включит; эффекты внутри по
// умолчанию все включены, чтобы первое включение сразу давало полный праздник.
export const DEFAULT_NEW_YEAR_SETTINGS: INewYearSettings = {
  isEnabled: false,
  effects: { snow: true, garland: true, countdown: true, winterBg: true },
};

export const NEW_YEAR_EFFECTS: INewYearEffectOption[] = [
  { key: "snow", label: "Снегопад", hint: "Снег поверх интерфейса" },
  { key: "garland", label: "Гирлянда", hint: "Огоньки вдоль верхнего края" },
  { key: "countdown", label: "Отсчёт", hint: "Сколько осталось до Нового года" },
  { key: "winterBg", label: "Зимний фон", hint: "Заменяет выбранный фон" },
];

export const NEW_YEAR_WINTER_BG = {
  light: "from-sky-50 via-white to-blue-100",
  dark: "from-slate-950 via-blue-950 to-indigo-950",
} as const;

/** Сколько дней после 1 января вместо отсчёта показываем поздравление. */
export const NEW_YEAR_GREETING_DAYS = 7;

export const GARLAND_COLORS = ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#ec4899"] as const;
export const GARLAND_BULB_COUNT = 64;

export const SNOW_DENSITY_PX = 14000;
export const SNOW_MAX_FLAKES = 140;
