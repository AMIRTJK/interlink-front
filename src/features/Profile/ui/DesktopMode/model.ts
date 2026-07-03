export type TDesktopScene = "space" | "aurora" | "mountains" | "ocean" | "rain" | "particles";

export interface ISceneOption {
  key: TDesktopScene;
  labelRu: string;
  labelEn: string;
}

export const SCENES: ISceneOption[] = [
  { key: "space", labelRu: "Космос", labelEn: "Space" },
  { key: "aurora", labelRu: "Сияние", labelEn: "Aurora" },
  { key: "mountains", labelRu: "Горы", labelEn: "Mountains" },
  { key: "ocean", labelRu: "Океан", labelEn: "Ocean" },
  { key: "rain", labelRu: "Дождь", labelEn: "Rain" },
  { key: "particles", labelRu: "Частицы", labelEn: "Particles" },
];

export const STORAGE_SCENE_KEY = "desktop_mode_scene";
