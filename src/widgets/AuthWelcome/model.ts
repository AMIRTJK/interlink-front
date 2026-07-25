import { ApiRoutes } from "@shared/api";

export interface IWelcomeAnimationProps {
  userName: string;
  themeGradient: string;
  accentColor: string;
  progress: number;
}

export type TWarmupImport = () => Promise<unknown>;

export const PROFILE_WARMUP_QUERY_KEY = [ApiRoutes.AUTH_ME, undefined, true];

export const WELCOME_GREETING = "Добро пожаловать";
export const WELCOME_TAGLINE = "Единая система электронного документооборота";
export const WELCOME_FALLBACK_NAME = "Коллега";

export const PROTOCOL_STEPS = [
  { label: "Токен подтверждён", at: 0.2 },
  { label: "Профиль загружен", at: 0.55 },
  { label: "Права применены", at: 0.9 },
];

export const MODULE_LABELS = [
  "Корреспонденция",
  "Задачи",
  "Кадры",
  "Аналитика",
];
