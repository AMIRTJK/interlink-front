export const SESSION_LOCK_STORAGE_KEY = "interlink/sessionLock";

// Атрибут корня экрана блокировки (выставлен в DesktopMode/ui.tsx): этот узел
// не получает inert, когда всё остальное под ним отключается.
export const SESSION_LOCK_ROOT_ATTR = "data-session-lock";

export type TUnlockResult = "ok" | "invalid" | "throttled" | "failed";

export const WRONG_PASSWORD_STATUSES: readonly number[] = [401, 422];

export const TOO_MANY_ATTEMPTS_STATUS = 429;

export const UNLOCK_ERROR_TEXTS: Record<Exclude<TUnlockResult, "ok">, string> = {
  invalid: "Неверный пароль",
  throttled: "Слишком много попыток. Повторите позже",
  failed: "Не удалось проверить пароль. Повторите попытку",
};

export const LOCK_TEXTS = {
  title: "Сеанс заблокирован",
  passwordLabel: "Пароль",
  passwordPlaceholder: "Введите пароль",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  submit: "Разблокировать",
  logout: "Выйти из системы",
  hideForm: "Скрыть",
  revealHint: "Нажмите любую клавишу",
} as const;
