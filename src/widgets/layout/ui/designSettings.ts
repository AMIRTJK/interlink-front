export interface ThemeInfo {
  gradient: string;
  swatch?: string;
  light: string;
  dark: string;
}

export const THEMES: Record<string, ThemeInfo> = {
  blue: {
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    light: "#007AFF",
    dark: "#0A84FF"
  },
  emerald: {
    gradient: "from-emerald-700 via-green-600 to-teal-700",
    light: "#166534",
    dark: "#14532d"
  },
  sunset: {
    gradient: "from-orange-500 via-pink-500 to-purple-600",
    light: "#FF9500",
    dark: "#FF9F0A"
  },
  ocean: {
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    light: "#5AC8FA",
    dark: "#64D2FF"
  },
  purple: {
    gradient: "from-purple-500 via-indigo-500 to-blue-600",
    light: "#AF52DE",
    dark: "#BF5AF2"
  },
  Aurora: {
    gradient: "from-emerald-400 via-teal-300 to-cyan-400",
    light: "#10B981",
    dark: "#34D399"
  },
  fury: {
    gradient: "from-rose-400 via-orange-300 to-amber-400",
    light: "#F43F5E",
    dark: "#FB7185"
  },
  Lavender: {
    gradient: "from-violet-400 via-purple-300 to-fuchsia-300",
    light: "#8B5CF6",
    dark: "#A78BFA"
  },
  coral: {
    gradient: "from-blue-500 via-cyan-400 to-teal-300",
    light: "#3B82F6",
    dark: "#60A5FA"
  },
  Peach: {
    gradient: "from-pink-300 via-rose-200 to-orange-200",
    light: "#F472B6",
    dark: "#FBCFE8"
  },
  galaxy: {
    gradient: "from-indigo-900 via-purple-700 via-fuchsia-500 to-blue-600",
    swatch: "from-[#0f0c29] via-[#302b63] via-[#6d28d9] via-[#a855f7] to-[#3b82f6]",
    light: "#7C3AED",
    dark: "#A855F7"
  }
};

export interface BackgroundInfo {
  name: string;
  light: string;
  dark: string;
}

export const BACKGROUNDS: Record<string, BackgroundInfo> = {
  arctic: {
    name: "Arctic Mist",
    light: "from-white via-slate-50 to-blue-50",
    dark: "from-slate-950 via-slate-900 to-blue-950"
  },
  lavender: {
    name: "Soft Lavender",
    light: "from-white via-violet-50 to-indigo-50",
    dark: "from-slate-950 via-violet-950 to-indigo-950"
  },
  warm: {
    name: "Warm Pearl",
    light: "from-white via-rose-50 to-orange-50",
    dark: "from-slate-950 via-rose-950 to-orange-950"
  },
  mint: {
    name: "Mint Breeze",
    light: "from-white via-emerald-50 to-cyan-50",
    dark: "from-slate-950 via-emerald-950 to-cyan-950"
  },
  space: {
    name: "Deep Space",
    light: "from-slate-100 via-indigo-50 to-violet-50",
    dark: "from-slate-950 via-indigo-950 to-violet-950"
  },
  graphite: {
    name: "Graphite Cloud",
    light: "from-zinc-100 via-white to-slate-100",
    dark: "from-zinc-950 via-zinc-900 to-slate-900"
  }
};

export type LayoutMode = "top" | "left" | "bottom" | "right";
