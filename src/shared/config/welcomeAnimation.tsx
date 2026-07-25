import { ComponentType } from "react";
import {
  FileStack,
  Network,
  Orbit,
  Sparkles,
  SquareTerminal,
} from "lucide-react";

export type TWelcomeAnimation =
  | "dossier"
  | "neural"
  | "aurora"
  | "orbit"
  | "protocol";

export type TWelcomeMode = "always" | "daily" | "off";

export interface IWelcomeAnimationOption {
  key: TWelcomeAnimation;
  labelRu: string;
  labelEn: string;
  descriptionRu: string;
  durationMs: number;
  swatch: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}

export interface IWelcomeModeOption {
  key: TWelcomeMode;
  labelRu: string;
}

export const WELCOME_ANIMATIONS: IWelcomeAnimationOption[] = [
  {
    key: "dossier",
    labelRu: "Досье",
    labelEn: "Dossier",
    descriptionRu: "Письма слетаются в стопку и заверяются печатью ЭЦП",
    durationMs: 7000,
    swatch: "from-slate-200 via-blue-300 to-indigo-500",
    icon: FileStack,
  },
  {
    key: "neural",
    labelRu: "Нейросеть",
    labelEn: "Neural",
    descriptionRu: "Узлы связи зажигаются и стягиваются в логотип системы",
    durationMs: 6500,
    swatch: "from-cyan-300 via-blue-500 to-indigo-700",
    icon: Network,
  },
  {
    key: "aurora",
    labelRu: "Аврора",
    labelEn: "Aurora",
    descriptionRu: "Градиентное сияние и световой свип по буквам бренда",
    durationMs: 5200,
    swatch: "from-emerald-300 via-teal-400 to-cyan-500",
    icon: Sparkles,
  },
  {
    key: "orbit",
    labelRu: "Орбита",
    labelEn: "Orbit",
    descriptionRu: "Модули системы выходят на орбиту и собираются в сетку",
    durationMs: 6200,
    swatch: "from-violet-400 via-purple-500 to-fuchsia-600",
    icon: Orbit,
  },
  {
    key: "protocol",
    labelRu: "Протокол",
    labelEn: "Protocol",
    descriptionRu: "Расшифровка данных и чек-лист защищённого подключения",
    durationMs: 6000,
    swatch: "from-zinc-300 via-slate-500 to-slate-800",
    icon: SquareTerminal,
  },
];

export const WELCOME_MODES: IWelcomeModeOption[] = [
  { key: "always", labelRu: "Всегда" },
  { key: "daily", labelRu: "Раз в день" },
  { key: "off", labelRu: "Выключить" },
];

export const DEFAULT_WELCOME_ANIMATION: TWelcomeAnimation = "dossier";
export const DEFAULT_WELCOME_MODE: TWelcomeMode = "always";

export const WELCOME_ANIMATION_KEY = "interlink/welcomeAnimation";
export const WELCOME_MODE_KEY = "interlink/welcomeMode";
export const WELCOME_LAST_SHOWN_KEY = "interlink/welcomeLastShown";
export const WELCOME_PENDING_KEY = "interlink/welcomePending";

export const WELCOME_TIMEOUT_MS = 9000;
export const WELCOME_SKIP_DELAY_MS = 1500;
export const WELCOME_REDUCED_MOTION_MS = 600;
export const WELCOME_EXIT_MS = 520;

const isBrowser = () => typeof window !== "undefined";

const today = () => new Date().toISOString().slice(0, 10);

export const getWelcomeAnimationOption = (key: TWelcomeAnimation) =>
  WELCOME_ANIMATIONS.find((item) => item.key === key) || WELCOME_ANIMATIONS[0];

export const welcomeStorage = {
  getAnimation: (): TWelcomeAnimation => {
    if (!isBrowser()) return DEFAULT_WELCOME_ANIMATION;
    const stored = localStorage.getItem(WELCOME_ANIMATION_KEY);
    const isKnown = WELCOME_ANIMATIONS.some((item) => item.key === stored);
    return isKnown ? (stored as TWelcomeAnimation) : DEFAULT_WELCOME_ANIMATION;
  },

  setAnimation: (key: TWelcomeAnimation) => {
    localStorage.setItem(WELCOME_ANIMATION_KEY, key);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: WELCOME_ANIMATION_KEY,
        newValue: key,
      }),
    );
  },

  getMode: (): TWelcomeMode => {
    if (!isBrowser()) return DEFAULT_WELCOME_MODE;
    const stored = localStorage.getItem(WELCOME_MODE_KEY);
    const isKnown = WELCOME_MODES.some((item) => item.key === stored);
    return isKnown ? (stored as TWelcomeMode) : DEFAULT_WELCOME_MODE;
  },

  setMode: (mode: TWelcomeMode) => {
    localStorage.setItem(WELCOME_MODE_KEY, mode);
  },

  markShown: () => {
    localStorage.setItem(WELCOME_LAST_SHOWN_KEY, today());
  },

  shouldShow: (): boolean => {
    const mode = welcomeStorage.getMode();
    if (mode === "off") return false;
    if (mode === "always") return true;
    return localStorage.getItem(WELCOME_LAST_SHOWN_KEY) !== today();
  },

  markPending: () => {
    sessionStorage.setItem(WELCOME_PENDING_KEY, "1");
  },

  isPending: (): boolean => {
    if (!isBrowser()) return false;
    return sessionStorage.getItem(WELCOME_PENDING_KEY) === "1";
  },

  clearPending: () => {
    if (!isBrowser()) return;
    sessionStorage.removeItem(WELCOME_PENDING_KEY);
  },
};
