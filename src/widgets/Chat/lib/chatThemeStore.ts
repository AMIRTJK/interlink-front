import { useSyncExternalStore } from "react";
import {
  CHAT_THEME_ATTRIBUTE,
  CHAT_THEME_STORAGE_KEY,
  DEFAULT_CHAT_THEME,
  getChatTheme,
  isChatThemeId,
  type IChatThemePresentation,
  type TChatThemeId,
} from "../model/chatThemes";

// ─── Выбранное оформление чата ────────────────────────────────────────────────
// Хранилище вне React: раздел «Чат» и всплывающее окно — два независимых
// поддерева, общего провайдера над ними нет, а оформление у них одно.
// useSyncExternalStore держит их в согласии и не требует контекста, поэтому
// читать выбор может любой компонент вглубь ленты.

const readStored = (): TChatThemeId => {
  try {
    const raw = localStorage.getItem(CHAT_THEME_STORAGE_KEY);
    return isChatThemeId(raw) ? raw : DEFAULT_CHAT_THEME;
  } catch {
    return DEFAULT_CHAT_THEME;
  }
};

let currentTheme: TChatThemeId = readStored();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => currentTheme;

/** На сервере рендера нет, но хук требует третий аргумент. */
const getServerSnapshot = () => DEFAULT_CHAT_THEME;

/**
 * Помечает документ выбранным оформлением: токены чата переопределяются на
 * <html>, поэтому одинаково действуют и внутри окна, и в порталах (меню
 * действий, реакции, просмотр вложений).
 */
export const applyChatThemeAttribute = (theme: TChatThemeId) => {
  document.documentElement.setAttribute(CHAT_THEME_ATTRIBUTE, theme);
};

export const setChatTheme = (theme: TChatThemeId) => {
  if (theme === currentTheme) return;
  currentTheme = theme;
  try {
    localStorage.setItem(CHAT_THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error("Не удалось сохранить оформление чата:", e);
  }
  applyChatThemeAttribute(theme);
  listeners.forEach((listener) => listener());
};

/** Текущее оформление. */
export const useChatThemeId = (): TChatThemeId =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/** Различия представления текущего оформления для компонентов ленты. */
export const useChatThemePresentation = (): IChatThemePresentation =>
  getChatTheme(useChatThemeId()).presentation;
