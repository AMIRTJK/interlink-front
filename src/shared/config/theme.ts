/**
 * Единая палитра тем оформления.
 *
 * Тема — это три цвета заливки (кнопки, свои сообщения, градиенты) и два
 * контрастных оттенка для текста и иконок: тёмный для светлого режима, светлый
 * для тёмного. Заливки в обоих режимах ОДНИ И ТЕ ЖЕ: если высветлять их в
 * тёмной теме, синий на почти чёрном фоне начинает светиться и выглядит ярче,
 * чем тот же синий в светлой. Режим меняет не цвет темы, а нейтральное
 * окружение вокруг него.
 *
 * Поверхности, границы и текст выводятся из акцента подмешиванием к нейтральной
 * базе, поэтому тема остаётся набором из пяти цветов, а не таблицей на полсотни
 * значений. `applyThemeTokens` раскладывает результат в CSS-переменные на
 * `<html>`, и вся разметка (включая чат) берёт цвета только оттуда.
 */

export const THEME_STORAGE_KEY = "currentTheme";
export const BG_STORAGE_KEY = "currentBg";
export const DESIGN_CHANGE_EVENT = "designsettingschange";
export const DEFAULT_THEME_KEY = "emerald";

/** Цвета заливок темы — одинаковые в светлом и тёмном режимах. */
export interface IThemeAccents {
  /** Основной акцент: кнопки, активные элементы, свои сообщения. */
  accent: string;
  /** Вторичный акцент — середина градиентов. */
  accent2: string;
  /** Третий акцент — хвост градиентов, вспомогательные иконки. */
  accent3: string;
}

export interface ThemeInfo {
  gradient: string;
  swatch?: string;
  light: string;
  dark: string;
  palette: {
    /** Заливки. Один набор на оба режима. */
    accents: IThemeAccents;
    /** Оттенок акцента для текста и иконок на поверхности — по режимам. */
    accentText: {
      light: string;
      dark: string;
    };
  };
}

export const THEMES: Record<string, ThemeInfo> = {
  blue: {
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    light: "#007AFF",
    dark: "#0A84FF",
    palette: {
      accents: { accent: "#2563EB", accent2: "#3B82F6", accent3: "#0EA5E9" },
      accentText: { light: "#1D4ED8", dark: "#93C5FD" },
    },
  },
  emerald: {
    gradient: "from-emerald-700 via-green-600 to-teal-700",
    light: "#166534",
    dark: "#14532d",
    palette: {
      accents: { accent: "#047857", accent2: "#059669", accent3: "#0D9488" },
      accentText: { light: "#065F46", dark: "#6EE7B7" },
    },
  },
  sunset: {
    gradient: "from-orange-500 via-pink-500 to-purple-600",
    light: "#FF9500",
    dark: "#FF9F0A",
    palette: {
      accents: { accent: "#EA580C", accent2: "#DB2777", accent3: "#9333EA" },
      accentText: { light: "#C2410C", dark: "#FDBA74" },
    },
  },
  ocean: {
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    light: "#5AC8FA",
    dark: "#64D2FF",
    palette: {
      accents: { accent: "#0891B2", accent2: "#2563EB", accent3: "#4F46E5" },
      accentText: { light: "#0E7490", dark: "#A5F3FC" },
    },
  },
  purple: {
    gradient: "from-purple-500 via-indigo-500 to-blue-600",
    light: "#AF52DE",
    dark: "#BF5AF2",
    palette: {
      accents: { accent: "#9333EA", accent2: "#6366F1", accent3: "#2563EB" },
      accentText: { light: "#7E22CE", dark: "#D8B4FE" },
    },
  },
  Aurora: {
    gradient: "from-emerald-400 via-teal-300 to-cyan-400",
    light: "#10B981",
    dark: "#34D399",
    palette: {
      accents: { accent: "#059669", accent2: "#0D9488", accent3: "#0891B2" },
      accentText: { light: "#047857", dark: "#A7F3D0" },
    },
  },
  fury: {
    gradient: "from-rose-400 via-orange-300 to-amber-400",
    light: "#F43F5E",
    dark: "#FB7185",
    palette: {
      accents: { accent: "#E11D48", accent2: "#EA580C", accent3: "#D97706" },
      accentText: { light: "#BE123C", dark: "#FECDD3" },
    },
  },
  Lavender: {
    gradient: "from-violet-400 via-purple-300 to-fuchsia-300",
    light: "#8B5CF6",
    dark: "#A78BFA",
    palette: {
      accents: { accent: "#7C3AED", accent2: "#9333EA", accent3: "#C026D3" },
      accentText: { light: "#6D28D9", dark: "#DDD6FE" },
    },
  },
  coral: {
    gradient: "from-blue-500 via-cyan-400 to-teal-300",
    light: "#3B82F6",
    dark: "#60A5FA",
    palette: {
      accents: { accent: "#2563EB", accent2: "#0891B2", accent3: "#0D9488" },
      accentText: { light: "#1D4ED8", dark: "#BFDBFE" },
    },
  },
  Peach: {
    gradient: "from-pink-300 via-rose-200 to-orange-200",
    light: "#F472B6",
    dark: "#FBCFE8",
    palette: {
      accents: { accent: "#DB2777", accent2: "#E11D48", accent3: "#EA580C" },
      accentText: { light: "#BE185D", dark: "#FBCFE8" },
    },
  },
  galaxy: {
    gradient: "from-indigo-900 via-purple-700 via-fuchsia-500 to-blue-600",
    swatch: "from-[#0f0c29] via-[#302b63] via-[#6d28d9] via-[#a855f7] to-[#3b82f6]",
    light: "#7C3AED",
    dark: "#A855F7",
    palette: {
      accents: { accent: "#4338CA", accent2: "#7E22CE", accent3: "#D946EF" },
      accentText: { light: "#312E81", dark: "#C7D2FE" },
    },
  },
};

/** Нейтральная база режима: к ней подмешивается акцент темы. */
const NEUTRALS = {
  light: {
    surface: "#FFFFFF",
    surface2: "#F4F5F8",
    text: "#18181B",
    textMuted: "#52525B",
    border: "#E4E4E7",
  },
  dark: {
    surface: "#16161C",
    surface2: "#20202A",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    border: "#2A2A35",
  },
} as const;

/** Доля акцента в нейтральных токенах: поверхности едва тонируются, границы заметнее. */
const TINT = {
  surface: 0.05,
  surface2: 0.08,
  text: 0.04,
  textMuted: 0.1,
  border: 0.2,
} as const;

type TRgb = [number, number, number];

const hexToRgb = (hex: string): TRgb => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const mix = (base: TRgb, accent: TRgb, ratio: number): TRgb => [
  Math.round(base[0] + (accent[0] - base[0]) * ratio),
  Math.round(base[1] + (accent[1] - base[1]) * ratio),
  Math.round(base[2] + (accent[2] - base[2]) * ratio),
];

const toTriplet = (rgb: TRgb) => `${rgb[0]} ${rgb[1]} ${rgb[2]}`;

/** Относительная яркость по WCAG — по ней решаем, тонет ли заливка в фоне. */
const luminance = ([r, g, b]: TRgb) => {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** Ниже этого порога заливка на тёмном фоне читается как грязное пятно. */
const DARK_FILL_MIN_LUMINANCE = 0.06;
const WHITE: TRgb = [255, 255, 255];

/**
 * Заливки одинаковы в обоих режимах — тема не должна менять цвет от режима.
 * Исключение одно: совсем тёмные акценты (тёмно-зелёный, индиго) на почти
 * чёрном фоне теряют границу с ним, поэтому их слегка поднимаем — ровно до
 * порога различимости, а не до «неонового» оттенка.
 */
const forDarkMode = (rgb: TRgb): TRgb => {
  let result = rgb;
  let ratio = 0;
  while (luminance(result) < DARK_FILL_MIN_LUMINANCE && ratio < 0.4) {
    ratio += 0.05;
    result = mix(rgb, WHITE, ratio);
  }
  return result;
};

export const getThemeInfo = (themeKey?: string): ThemeInfo =>
  THEMES[themeKey ?? ""] || THEMES[DEFAULT_THEME_KEY];

/**
 * Полный набор токенов темы в виде «r g b» — значения подставляются в
 * `rgb(var(--th-…) / alpha)`, поэтому прозрачность остаётся на стороне разметки.
 */
export const buildThemeTokens = (
  themeKey: string,
  isDark: boolean,
): Record<string, string> => {
  const mode = isDark ? "dark" : "light";
  const { accents, accentText } = getThemeInfo(themeKey).palette;
  const neutral = NEUTRALS[mode];

  const fill = (hex: string) => {
    const rgb = hexToRgb(hex);
    return isDark ? forDarkMode(rgb) : rgb;
  };

  const accent = fill(accents.accent);

  return {
    "--th-accent-rgb": toTriplet(accent),
    "--th-accent-2-rgb": toTriplet(fill(accents.accent2)),
    "--th-accent-3-rgb": toTriplet(fill(accents.accent3)),
    "--th-accent-strong-rgb": toTriplet(hexToRgb(accentText[mode])),
    "--th-surface-rgb": toTriplet(mix(hexToRgb(neutral.surface), accent, TINT.surface)),
    "--th-surface-2-rgb": toTriplet(mix(hexToRgb(neutral.surface2), accent, TINT.surface2)),
    "--th-text-rgb": toTriplet(mix(hexToRgb(neutral.text), accent, TINT.text)),
    "--th-text-muted-rgb": toTriplet(mix(hexToRgb(neutral.textMuted), accent, TINT.textMuted)),
    "--th-border-rgb": toTriplet(mix(hexToRgb(neutral.border), accent, TINT.border)),
  };
};

/** Записывает токены активной темы в корень документа. */
export const applyThemeTokens = (themeKey: string, isDark: boolean) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const tokens = buildThemeTokens(themeKey, isDark);
  Object.entries(tokens).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
};

export const readThemeKey = (): string => {
  if (typeof window === "undefined") return DEFAULT_THEME_KEY;
  return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_KEY;
};
