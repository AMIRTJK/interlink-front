import type { Transition } from "framer-motion";

export type TDesktopScene =
  | "space"
  | "aurora"
  | "mountains"
  | "ocean"
  | "rain"
  | "campfire"
  | "newyear"
  | "particles"
  | "clock";

/**
 * `centered` — фон декоративный, время и карточка стоят по центру поверх него.
 * `split` — у сцены есть собственный предмет (часы), он встаёт в раскладку рядом
 * с карточкой, а не под неё.
 * `stage` — предмет сцены стоит по центру внизу (костёр, ёлка), время и карточка
 * поднимаются над ним.
 */
export type TSceneLayout = "centered" | "split" | "stage";

export interface ISceneOption {
  key: TDesktopScene;
  labelRu: string;
  labelEn: string;
  layout: TSceneLayout;
  // Сцена всегда ночная: оформление экрана тёмное независимо от темы приложения.
  isAlwaysNight?: boolean;
  // Форма пароля скрыта, пока её не позовут кликом или клавишей: в покое — только сцена.
  isFormOnDemand?: boolean;
}

export const SCENES: ISceneOption[] = [
  { key: "campfire", labelRu: "Костёр", labelEn: "Campfire", layout: "stage", isAlwaysNight: true, isFormOnDemand: true },
  { key: "newyear", labelRu: "Новый год", labelEn: "New Year", layout: "stage", isAlwaysNight: true, isFormOnDemand: true },
  { key: "space", labelRu: "Космос", labelEn: "Space", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "aurora", labelRu: "Сияние", labelEn: "Aurora", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "mountains", labelRu: "Горы", labelEn: "Mountains", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "ocean", labelRu: "Океан", labelEn: "Ocean", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "rain", labelRu: "Дождь", labelEn: "Rain", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "particles", labelRu: "Частицы", labelEn: "Particles", layout: "centered", isAlwaysNight: true, isFormOnDemand: true },
  { key: "clock", labelRu: "Часы", labelEn: "Clock", layout: "split", isAlwaysNight: true },
];

export const DEFAULT_SCENE: TDesktopScene = "campfire";

export const STORAGE_SCENE_KEY = "desktop_mode_scene";

// Экран блокировки лежит на z-[9999]; без этого подсказки antd (z 1070) уходят под него.
export const LOCK_TOOLTIP_Z_INDEX = 10000;

// Метки нижней границы содержимого (карточка или подсказка) и подвала экрана
// блокировки: сцены «Костёр» и «Новый год» ставят огонь и ёлку в промежуток между ними.
export const LOCK_ANCHOR_SELECTOR = "[data-lock-anchor]";
export const LOCK_FOOTER_SELECTOR = "[data-lock-footer]";

// Плавное появление и растворение кнопок управления без смещения:
// прозрачность анимируем прямо на элементе с backdrop-filter (стекло гаснет целиком),
// а отсутствие сдвига не ломает layoutId активной сцены и не дёргает раскладку.
export const CONTROLS_FADE_TRANSITION: Record<"show" | "hide", Transition> = {
  show: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  hide: { duration: 0.65, ease: [0.4, 0, 0.2, 1] },
};
