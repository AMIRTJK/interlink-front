import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenControl } from "../lib/tokenControl";
import { toast } from "react-toastify";
import { AppRoutes } from "@shared/config";

export const _axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  async (error: AxiosError<any>) => {
    toast.dismiss();

    const { status } = error.response || {};

    if (status === 401) {
      toast.error("Пользователь не авторизован");
      tokenControl.remove();
      window.location.href = AppRoutes.AUTH;
    }

    return Promise.reject(error);
  }
);
