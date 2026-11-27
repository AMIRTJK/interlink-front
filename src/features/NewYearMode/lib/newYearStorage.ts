import {
  DEFAULT_NEW_YEAR_SETTINGS,
  NEW_YEAR_CHANGE_EVENT,
  NEW_YEAR_STORAGE_KEY,
  type INewYearSettings,
} from "../model";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Битое или устаревшее значение в хранилище не должно ронять раскладку:
// неизвестные поля отбрасываем, недостающие берём из дефолтов.
export const readNewYearSettings = (): INewYearSettings => {
  if (typeof window === "undefined") return DEFAULT_NEW_YEAR_SETTINGS;

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(NEW_YEAR_STORAGE_KEY) ?? "null");
    if (!isRecord(parsed)) return DEFAULT_NEW_YEAR_SETTINGS;

    const effects = isRecord(parsed.effects) ? parsed.effects : {};
    const defaults = DEFAULT_NEW_YEAR_SETTINGS.effects;

    return {
      isEnabled: parsed.isEnabled === true,
      effects: {
        snow: typeof effects.snow === "boolean" ? effects.snow : defaults.snow,
        garland: typeof effects.garland === "boolean" ? effects.garland : defaults.garland,
        countdown: typeof effects.countdown === "boolean" ? effects.countdown : defaults.countdown,
        winterBg: typeof effects.winterBg === "boolean" ? effects.winterBg : defaults.winterBg,
      },
    };
  } catch {
    return DEFAULT_NEW_YEAR_SETTINGS;
  }
};

export const writeNewYearSettings = (settings: INewYearSettings) => {
  localStorage.setItem(NEW_YEAR_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(NEW_YEAR_CHANGE_EVENT));
};
