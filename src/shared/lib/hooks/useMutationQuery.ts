import { _axios, ApiRoutes } from "@shared/api";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { tokenControl } from "../tokenControl";

/* ===================== TYPES ===================== */

/** Расширяем стандартный конфиг Axios нашими полями */
interface CustomAxiosRequestConfig<T = any> extends Omit<AxiosRequestConfig<T>, "headers"> {
  suppressErrorToast?: boolean;
  skipAuth?: boolean;
  headers?: Record<string, string>;
}

export interface IApiResponse<TData = any> {
  success: boolean;
  message: string;
  data: TData;
}

interface ISecondMutationQuery<TFirstData, TSecondData> {
  url: string | ((data: TFirstData) => string);
  method?: "GET" | "POST";
  paramsFromFirst?: (data: TFirstData) => any;
}

interface IUseMutationQueryOptions<TRequest, TData, TSecondData> {
  url: string | ((data: TRequest) => string);
  method: "POST" | "PUT" | "DELETE" | "GET" | "PATCH";
  messages?: {
    success?: string;
    error?: string;
    invalidate?: string[];
    onSuccessCb?: (data: any) => void;
    onErrorCb?: () => void;
  };
  queryParams?: Record<string, unknown>;
  queryOptions?: UseMutationOptions<any, AxiosError, TRequest, unknown>;
  secondQuery?: ISecondMutationQuery<TData, TSecondData>;
  skipAuth?: boolean;
  preload?: boolean; // грузим permissions
  preloadConditional?: string[]; // permissions для разрешения мутации
}

/* ===================== HOOK ===================== */
export const useMutationQuery = <
  TRequest = any,
  TData = any,
  TSecondData = any
>(
  options: IUseMutationQueryOptions<TRequest, TData, TSecondData>
) => {
  const { 
    url, 
    method, 
    messages, 
    queryOptions, 
    secondQuery, 
    skipAuth = false,
    preload,
    preloadConditional
  } = options;
  
  const queryClient = useQueryClient();

  /* ---------- PERMISSIONS CHECK ---------- */
  const permissionsQuery = useQuery({
    queryKey: [ApiRoutes.FETCH_PERMISSIONS],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = tokenControl.get();
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const response = await _axios(ApiRoutes.FETCH_PERMISSIONS, {
        method: "GET",
        headers,
      });
      return response.data.data;
    },
    enabled: !!preload && tokenControl.get() !== null,
    staleTime: 1000 * 60 * 5,
  });

  // Учитываем загрузку прав в состоянии isAllowed, чтобы кнопка была disabled (а не loading)
  const isAllowedResult = useMemo(() => {
    if (!preload) return true;
    if (permissionsQuery.isLoading) return false; 
    if (!permissionsQuery.isSuccess || !permissionsQuery.data) return false;
    if (!preloadConditional || !preloadConditional.length) return true;

    const currentPermissions = (permissionsQuery.data as { name: string }[]).map(p => p.name);
    return preloadConditional.every(perm => currentPermissions.includes(perm));
  }, [preload, permissionsQuery.isLoading, permissionsQuery.isSuccess, permissionsQuery.data, preloadConditional]);

  /* ---------- MUTATION FUNCTION ---------- */
  const mutationFn = useCallback(
    async (requestData: TRequest): Promise<TSecondData | TData> => {
      // Защита: если права нужны, но их нет ИЛИ они еще грузятся - блокируем выполнение
      if (preload && !isAllowedResult) {
        const errorMsg = "У вас недостаточно прав для выполнения этой операции";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 1. ПЕРВЫЙ ЗАПРОС (Основная мутация)
      const firstUrl = typeof url === "function" ? url(requestData) : url;
      
      const firstResponse = await _axios<IApiResponse<TData>>({
        url: firstUrl,
        method,
        data: requestData,
        suppressErrorToast: Boolean(messages?.error),
        skipAuth,
      } as CustomAxiosRequestConfig);

      const firstBody = firstResponse.data;

      if (!firstBody.success) {
        throw new Error(firstBody.message || "Ошибка при выполнении операции");
      }

      const firstData = firstBody.data;

      // 2. ВТОРОЙ ЗАПРОС (Цепочка)
      if (secondQuery) {
        const secondUrl = typeof secondQuery.url === "function" 
          ? secondQuery.url(firstData) 
          : secondQuery.url;
        
        const secondMethod = secondQuery.method || "GET";
        const secondParams = secondQuery.paramsFromFirst 
          ? secondQuery.paramsFromFirst(firstData) 
          : undefined;

        const secondResponse = await _axios<IApiResponse<TSecondData>>({
          url: secondUrl,
          method: secondMethod,
          [secondMethod === "POST" ? "data" : "params"]: secondParams,
          skipAuth,
        } as CustomAxiosRequestConfig);

        const secondBody = secondResponse.data;

        if (!secondBody.success) {
          throw new Error(secondBody.message || "Ошибка при получении дополнительных данных");
        }

        return secondBody.data;
      }

      return firstData;
    },
    [url, method, skipAuth, messages, secondQuery, preload, isAllowedResult]
  );

  const mutation = useMutation({
    mutationFn,
    ...queryOptions,

    onSuccess: (finalData, variables, context) => {
      const successMessage = messages?.success || "Операция успешно выполнена";
      if (successMessage && method !== "GET") {
        toast.success(successMessage);
      }

      messages?.onSuccessCb?.(finalData);
      queryOptions?.onSuccess?.(finalData, variables, context);

      if (messages?.invalidate) {
        messages.invalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },

    onError: (error: AxiosError, variables, context) => {
      if (error.message !== "У вас недостаточно прав для выполнения этой операции") {
        const errorData = error.response?.data as IApiResponse<any> | undefined;
        const message = errorData?.message || error.message || messages?.error || "Произошла ошибка";
        toast.error(message);
      }
      
      messages?.onErrorCb?.();
      queryOptions?.onError?.(error, variables, context);
    },
  });

  return {
    ...mutation,
    isAllowed: isAllowedResult, 
  };
};