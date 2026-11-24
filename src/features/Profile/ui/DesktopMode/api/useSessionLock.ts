/*
 * Адаптер блокировки сеанса. UI знает только { isLocked, lock, unlock(password) },
 * поэтому переход на серверную блокировку меняет лишь этот файл.
 *
 * Сейчас блокировка живёт только в браузере: флаг в localStorage
 * (lib/sessionLockStore), а пароль проверяется повторным входом через
 * ApiRoutes.LOGIN (api/verifyPasswordByLogin). Токен сеанса при этом не
 * меняется, и API для «заблокированной» вкладки продолжает отвечать.
 *
 * Что нужно от бэкенда:
 * - POST /api/v1/auth/lock — помечает текущий токен/сессию флагом locked;
 * - POST /api/v1/auth/unlock { password } — проверяет пароль владельца токена
 *   и снимает флаг (422 — неверный пароль, 429 — превышен лимит попыток);
 * - поле locked в ответе GET /api/v1/auth/me, чтобы экран блокировки
 *   восстанавливался с сервера, а не из localStorage;
 * - отказ всех остальных ручек для заблокированной сессии (например, 423 Locked).
 *
 * Что заменить при подключении:
 * - добавить AUTH_LOCK / AUTH_UNLOCK в ApiRoutes;
 * - lock(): вызвать AUTH_LOCK, затем writeSessionLocked(true);
 * - unlock(): вместо verifyPasswordByLogin — AUTH_UNLOCK с паролем;
 * - isLocked: брать из auth/me (localStorage оставить как быстрый кэш до ответа);
 * - в http-интерцепторе на 423 включать writeSessionLocked(true);
 * - убрать LOCK_TEXTS.browserOnlyNotice с экрана блокировки.
 */
import { useCallback, useSyncExternalStore } from "react";
import type { TUnlockResult } from "../lockModel";
import {
  readIsSessionLocked,
  subscribeSessionLock,
  writeSessionLocked,
} from "../lib/sessionLockStore";
import { verifyPasswordByLogin } from "./verifyPasswordByLogin";
import { useLockUser } from "./useLockUser";

export interface ISessionLock {
  isLocked: boolean;
  lock: () => void;
  unlock: (password: string) => Promise<TUnlockResult>;
}

export const useSessionLock = (): ISessionLock => {
  const isLocked = useSyncExternalStore(subscribeSessionLock, readIsSessionLocked);
  const user = useLockUser();
  const phone = user?.phone;

  const lock = useCallback(() => writeSessionLocked(true), []);

  const unlock = useCallback(
    async (password: string): Promise<TUnlockResult> => {
      if (!phone) return "failed";
      const result = await verifyPasswordByLogin(phone, password);
      if (result === "ok") writeSessionLocked(false);
      return result;
    },
    [phone],
  );

  return { isLocked, lock, unlock };
};
