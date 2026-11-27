import { NEW_YEAR_GREETING_DAYS } from "../model";

export type TNewYearCountdown =
  | { kind: "greeting"; year: number }
  | { kind: "countdown"; year: number; days: number; hours: number; minutes: number; seconds: number };

const MS_IN_SECOND = 1000;
const SECONDS_IN_DAY = 86400;

/** Отсчёт до ближайшего 1 января по местному времени; первую неделю года — поздравление. */
export const getNewYearCountdown = (now: Date): TNewYearCountdown => {
  const year = now.getFullYear();

  if (now.getMonth() === 0 && now.getDate() <= NEW_YEAR_GREETING_DAYS) {
    return { kind: "greeting", year };
  }

  const target = new Date(year + 1, 0, 1);
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / MS_IN_SECOND));

  return {
    kind: "countdown",
    year: year + 1,
    days: Math.floor(totalSeconds / SECONDS_IN_DAY),
    hours: Math.floor((totalSeconds % SECONDS_IN_DAY) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export const padTime = (value: number) => String(value).padStart(2, "0");
