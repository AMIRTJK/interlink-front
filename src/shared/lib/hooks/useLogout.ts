import { toast } from "@shared/lib/toast";
import { _axios, ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { tokenControl } from "../tokenControl";
import { queryClient } from "../queryClient";

export const useLogout = () => {
  return async () => {
    toast.info("Выход из системы!");
    try {
      await _axios.post(ApiRoutes.LOGOUT);
    } catch {
    } finally {
      tokenControl.remove();
      queryClient.clear();
      if (window.location.pathname !== AppRoutes.LOGIN) {
        window.location.replace(AppRoutes.LOGIN);
      }
    }
  };
};
