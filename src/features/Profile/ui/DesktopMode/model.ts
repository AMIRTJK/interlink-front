export type TDesktopScene = "space" | "aurora" | "mountains" | "ocean" | "rain" | "snow" | "campfire" | "matrix" | "particles" | "clock";

/**
 * `centered` — фон декоративный, время и карточка стоят по центру поверх него.
 * `split` — у сцены есть собственный предмет (часы), он встаёт в раскладку рядом
 * с карточкой, а не под неё.
 */
export type TSceneLayout = "centered" | "split";

export interface ISceneOption {
  key: TDesktopScene;
  labelRu: string;
  labelEn: string;
  layout: TSceneLayout;
}

export const SCENES: ISceneOption[] = [
  { key: "space", labelRu: "Космос", labelEn: "Space", layout: "centered" },
  { key: "aurora", labelRu: "Сияние", labelEn: "Aurora", layout: "centered" },
  { key: "mountains", labelRu: "Горы", labelEn: "Mountains", layout: "centered" },
  { key: "ocean", labelRu: "Океан", labelEn: "Ocean", layout: "centered" },
  { key: "rain", labelRu: "Дождь", labelEn: "Rain", layout: "centered" },
  { key: "snow", labelRu: "Снег", labelEn: "Snow", layout: "centered" },
  { key: "campfire", labelRu: "Костёр", labelEn: "Campfire", layout: "centered" },
  { key: "matrix", labelRu: "Матрица", labelEn: "Matrix", layout: "centered" },
  { key: "particles", labelRu: "Частицы", labelEn: "Particles", layout: "centered" },
  { key: "clock", labelRu: "Часы", labelEn: "Clock", layout: "split" },
];

export const STORAGE_SCENE_KEY = "desktop_mode_scene";

// Экран блокировки лежит на z-[9999]; без этого подсказки antd (z 1070) уходят под него.
export const LOCK_TOOLTIP_Z_INDEX = 10000;
