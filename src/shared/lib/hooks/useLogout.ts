import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { _axios, ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { tokenControl } from "../tokenControl";

/**
 * Выход из системы.
 * Сначала сообщаем бэкенду об инвалидации Sanctum-токена (POST /auth/logout),
 * затем чистим локальное состояние и уходим на экран входа.
 * Локальный выход выполняется в любом случае — даже если запрос упал.
 */
export const useLogout = () => {
  const navigate = useNavigate();

  return async () => {
    toast.info("Выход из системы!");
    try {
      // Токен подставит axios-интерцептор, поэтому запрос идёт до remove()
      await _axios.post(ApiRoutes.LOGOUT);
    } catch {
      // best-effort: продолжаем локальный выход независимо от ответа сервера
    } finally {
      tokenControl.remove();
      navigate(AppRoutes.LOGIN, { replace: true });
    }
  };
};
