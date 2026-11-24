import axios from "axios";
import { _axios, ApiRoutes, type CustomAxiosRequestConfig } from "@shared/api";
import type { ILoginRequest, ILoginResponse } from "@entities/login";
import {
  TOO_MANY_ATTEMPTS_STATUS,
  WRONG_PASSWORD_STATUSES,
  type TUnlockResult,
} from "../lockModel";

interface ILoginEnvelope {
  success?: boolean;
  data?: ILoginResponse;
}

/**
 * Временная проверка пароля повторным входом по телефону текущего пользователя.
 *
 * Идёт напрямую через `_axios`, а не `useMutationQuery`: нужен Promise с
 * результатом для адаптера и никаких автоматических тостов. `skipAuth` не даёт
 * интерцептору при 401 разлогинить пользователя. Выданный ручкой токен
 * отбрасывается — текущий токен в tokenControl не перезаписывается.
 * Побочный эффект: на сервере остаётся неиспользуемый токен (Sanctum).
 */
export const verifyPasswordByLogin = async (
  phone: string,
  password: string,
): Promise<TUnlockResult> => {
  const body: ILoginRequest = { phone, password };
  try {
    const { data } = await _axios.post<ILoginEnvelope>(ApiRoutes.LOGIN, body, {
      skipAuth: true,
    } as CustomAxiosRequestConfig);
    if (data?.success === false) return "invalid";
    // При включённой MFA ручка отдаёт challenge без токена — пароль при этом
    // уже принят, второй фактор для разблокировки не требуем.
    return data?.data?.token || data?.data?.mfa_required ? "ok" : "invalid";
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status && WRONG_PASSWORD_STATUSES.includes(status)) return "invalid";
    if (status === TOO_MANY_ATTEMPTS_STATUS) return "throttled";
    console.error("Не удалось проверить пароль для разблокировки", error);
    return "failed";
  }
};
