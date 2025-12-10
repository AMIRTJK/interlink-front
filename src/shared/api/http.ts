import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { AppRoutes, getEnvVar } from "@shared/config";
import { tokenControl } from "@shared/lib";

export const _axios = axios.create({
  baseURL: getEnvVar("VITE_API_URL"),
});

_axios.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const token = tokenControl.get();

  if (!config.skipAuth) {
    if (!token) {
      tokenControl.remove();
      window.location.href = AppRoutes.LOGIN;
      return Promise.reject(new axios.Cancel("Token expired"));
    }
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers.set("Access-Control-Allow-Origin", "*");
  return config;
});

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig<unknown> {
  suppressErrorToast?: boolean;
  skipAuth?: boolean;
}

_axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    toast.dismiss();

    const { status } = error.response || {};

    if (status === 401) {
      toast.error("Пользователь не авторизован");
      tokenControl.remove();
      window.location.href = AppRoutes.LOGIN;
    }

    return Promise.reject(error);
  }
);
