import { tokenControl } from "@shared/lib";
import { SESSION_LOCK_STORAGE_KEY } from "../lockModel";

type TListener = () => void;

const listeners = new Set<TListener>();

// В localStorage пишем не `true`, а отпечаток текущего токена: после выхода и
// нового входа токен другой, и старый флаг не должен запирать свежий сеанс.
// Хеш необратим и сам токен повторно нигде не сохраняет.
const getSessionFingerprint = (token: string): string => {
  let hash = 5381;
  for (let i = 0; i < token.length; i += 1) {
    hash = ((hash << 5) + hash + token.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

export const readIsSessionLocked = (): boolean => {
  const token = tokenControl.get();
  if (!token) return false;
  return localStorage.getItem(SESSION_LOCK_STORAGE_KEY) === getSessionFingerprint(token);
};

export const writeSessionLocked = (isLocked: boolean) => {
  const token = tokenControl.get();
  if (isLocked && token) {
    localStorage.setItem(SESSION_LOCK_STORAGE_KEY, getSessionFingerprint(token));
  } else {
    localStorage.removeItem(SESSION_LOCK_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
};

// Событие storage приходит только из других вкладок — так блокировка и
// разблокировка синхронизируются между всеми открытыми вкладками портала.
export const subscribeSessionLock = (listener: TListener) => {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_LOCK_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};
