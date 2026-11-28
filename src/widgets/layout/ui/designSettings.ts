/* Палитра тем живёт в `@shared/config/theme`: оттуда её берут и раскладка, и
   чат, и провайдер CSS-переменных. Здесь остаётся только реэкспорт, чтобы не
   править два десятка существующих импортов. */
export { THEMES } from "@shared/config";
export type { ThemeInfo } from "@shared/config";

export interface BackgroundInfo {
  name: string;
  light: string;
  dark: string;
}

export const BACKGROUNDS: Record<string, BackgroundInfo> = {
  arctic: {
    name: "Arctic Mist",
    light: "from-white via-slate-50 to-blue-50",
    dark: "from-th-deep via-th-base to-blue-950"
  },
  lavender: {
    name: "Soft Lavender",
    light: "from-white via-violet-50 to-indigo-50",
    dark: "from-th-deep via-violet-950 to-indigo-950"
  },
  warm: {
    name: "Warm Pearl",
    light: "from-white via-rose-50 to-orange-50",
    dark: "from-th-deep via-rose-950 to-orange-950"
  },
  mint: {
    name: "Mint Breeze",
    light: "from-white via-emerald-50 to-cyan-50",
    dark: "from-th-deep via-emerald-950 to-cyan-950"
  },
  space: {
    name: "Deep Space",
    light: "from-slate-100 via-indigo-50 to-violet-50",
    dark: "from-th-deep via-indigo-950 to-violet-950"
  },
  graphite: {
    name: "Graphite Cloud",
    light: "from-zinc-100 via-white to-slate-100",
    dark: "from-th-deep via-th-base to-th-base"
  }
};

export type LayoutMode = "top" | "left" | "bottom" | "right";
