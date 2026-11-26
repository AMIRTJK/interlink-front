export type TDesktopScene = "space" | "aurora" | "mountains" | "ocean" | "rain" | "snow" | "campfire" | "matrix" | "particles" | "clock";

/**
 * `centered` — фон декоративный, время и карточка стоят по центру поверх него.
 * `split` — у сцены есть собственный предмет (часы), он встаёт в раскладку рядом
 * с карточкой, а не под неё.
 * `stage` — предмет сцены стоит по центру внизу (костёр), время и карточка
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
  { key: "space", labelRu: "Космос", labelEn: "Space", layout: "centered" },
  { key: "aurora", labelRu: "Сияние", labelEn: "Aurora", layout: "centered" },
  { key: "mountains", labelRu: "Горы", labelEn: "Mountains", layout: "centered" },
  { key: "ocean", labelRu: "Океан", labelEn: "Ocean", layout: "centered" },
  { key: "rain", labelRu: "Дождь", labelEn: "Rain", layout: "centered" },
  { key: "snow", labelRu: "Снег", labelEn: "Snow", layout: "centered" },
  { key: "campfire", labelRu: "Костёр", labelEn: "Campfire", layout: "stage", isAlwaysNight: true, isFormOnDemand: true },
  { key: "matrix", labelRu: "Матрица", labelEn: "Matrix", layout: "centered" },
  { key: "particles", labelRu: "Частицы", labelEn: "Particles", layout: "centered" },
  { key: "clock", labelRu: "Часы", labelEn: "Clock", layout: "split" },
];

export const STORAGE_SCENE_KEY = "desktop_mode_scene";

// Экран блокировки лежит на z-[9999]; без этого подсказки antd (z 1070) уходят под него.
export const LOCK_TOOLTIP_Z_INDEX = 10000;

// Метки нижней границы содержимого (карточка или подсказка) и подвала экрана
// блокировки: сцена «Костёр» ставит огонь в промежуток между ними.
export const LOCK_ANCHOR_SELECTOR = "[data-lock-anchor]";
export const LOCK_FOOTER_SELECTOR = "[data-lock-footer]";
