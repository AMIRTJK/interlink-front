import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "@shared/lib/toast";
import { AppRoutes, getEnvVar } from "@shared/config";
import { tokenControl, queryClient } from "@shared/lib";
import { ApiRoutes } from "./api-routes";

export const _axios = axios.create({
  baseURL: getEnvVar("VITE_API_URL"),
});

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig<unknown> {
  suppressErrorToast?: boolean;
  skipAuth?: boolean;
}

_axios.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const token = tokenControl.get();

  if (!config.skipAuth) {
    if (!token) {
      tokenControl.remove();
      queryClient.clear();
      if (window.location.pathname !== AppRoutes.LOGIN) {
        window.location.replace(AppRoutes.LOGIN);
      }
      return Promise.reject(new axios.Cancel("Token expired"));
    }
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers.set("Access-Control-Allow-Origin", "*");
  return config;
});

_axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    const { status } = error.response || {};
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      status === 401 &&
      !originalRequest?.skipAuth &&
      !originalRequest?.url?.includes(ApiRoutes.LOGOUT)
    ) {
      toast.error("Пользователь не авторизован");
      tokenControl.remove();
      queryClient.clear();
      if (window.location.pathname !== AppRoutes.LOGIN) {
        window.location.replace(AppRoutes.LOGIN);
      }
    }

    return Promise.reject(error);
  }
);
