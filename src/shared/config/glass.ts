/**
 * Эффект «стекла» (glassmorphism) для ключевых поверхностей интерфейса.
 *
 * По умолчанию выключен: пользователь включает его кнопкой в хедере. Состояние
 * хранится одним классом на <html> — сами стили лежат в `app/styles/glass.css`
 * и применяются только при этом классе, поэтому переключение не требует
 * ререндера разметки, ровно как смена темы.
 *
 * Поверхность помечается классом `ui-glass` — он ничего не делает, пока эффект
 * не включён.
 */

export const GLASS_STORAGE_KEY = "glassEffect";
export const GLASS_ROOT_CLASS = "glass-ui";
export const GLASS_CHANGE_EVENT = "glasseffectchange";

const GLASS_ON = "on";
const GLASS_OFF = "off";

export const readGlassEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GLASS_STORAGE_KEY) === GLASS_ON;
};

export const writeGlassEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GLASS_STORAGE_KEY, enabled ? GLASS_ON : GLASS_OFF);
};

export const applyGlassClass = (enabled: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(GLASS_ROOT_CLASS, enabled);
};
