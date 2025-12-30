// V1-с одним запросом


// import { _axios } from "@shared/api";
// import {
//   useMutation,
//   UseMutationOptions,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { AxiosError, AxiosRequestConfig } from "axios";
// import { useCallback } from "react";
// import { toast } from "react-toastify";

// interface CustomAxiosRequestConfig<T = unknown> extends Omit<
//   AxiosRequestConfig<T>,
//   "headers"
// > {
//   suppressErrorToast?: boolean;
//   skipAuth?: boolean;
// }

// // Тип ответа API с success/message/data
// export interface IApiResponse<TData = unknown> {
//   success: boolean;
//   message: string;
//   data: TData;
// }

// // Опции для useMutationQuery
// interface IUseMutationQueryOptions<TRequest = unknown, TData = unknown> {
//   url: string | ((data: TRequest) => string);
//   method: "POST" | "PUT" | "DELETE" | "GET" | "PATCH";
//   messages?: {
//     success?: string;
//     error?: string;
//     invalidate?: string[];
//     onSuccessCb?: (data: TData) => void; // возвращаем уже data
//     onErrorCb?: () => void;
//   };
//   queryParams?: Record<string, unknown>;
//   queryOptions?: UseMutationOptions<TData, unknown, TRequest, unknown>;
//   skipAuth?: boolean;
// }

// // Хук useMutationQuery с типизацией
// export const useMutationQuery = <TRequest = unknown, TData = unknown>(
//   options: IUseMutationQueryOptions<TRequest, TData>
// ) => {
//   const { url, method, messages, queryOptions, skipAuth = false } = options;
//   const queryClient = useQueryClient();

//   const mutationFn = useCallback(
//     async (data: TRequest): Promise<TData> => {
//       const requestUrl = typeof url === "function" ? url(data) : url;

//       const response = await _axios<IApiResponse<TData>>({
//         url: requestUrl,
//         method,
//         data,
//         suppressErrorToast: Boolean(messages?.error),
//         skipAuth,
//       } as CustomAxiosRequestConfig<TRequest>);

//       const body = response.data;

//       if (!body.success) {
//         throw new Error(body.message || "Ошибка запроса");
//       }

//       const successMessage = messages?.success || body.message || "Успешно";

//       if (successMessage) {
//         toast.success(successMessage);
//       }

//       return body.data; // возвращаем только data
//     },
//     [url, method, skipAuth, messages]
//   );

//   return useMutation<TData, AxiosError, TRequest>({
//     mutationFn,
//     ...queryOptions,

//     onSuccess: (data, variables, context) => {
//       messages?.onSuccessCb?.(data);
//       queryOptions?.onSuccess?.(data, variables, context);

//       if (messages?.invalidate) {
//         queryClient.invalidateQueries({ queryKey: messages.invalidate });
//       }
//     },

//     onError: (error, variables, context) => {
//       const data = error.response?.data as IApiResponse<TData> | undefined;
//       const message =
//         data?.message || error.message || messages?.error || "Произошла ошибка";

//       toast.error(message);
//       messages?.onErrorCb?.();
//       queryOptions?.onError?.(error, variables, context);
//     },
//   });
// };


// V2-с двумя запросами
import { _axios } from "@shared/api";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useCallback } from "react";
import { toast } from "react-toastify";

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
}

/* ===================== HOOK ===================== */
export const useMutationQuery = <
  TRequest = any,
  TData = any,
  TSecondData = any
>(
  options: IUseMutationQueryOptions<TRequest, TData, TSecondData>
) => {
  const { url, method, messages, queryOptions, secondQuery, skipAuth = false } = options;
  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    async (requestData: TRequest): Promise<TSecondData | TData> => {
      // 1. ПЕРВЫЙ ЗАПРОС (Основная мутация)
      const firstUrl = typeof url === "function" ? url(requestData) : url;
      
      const firstResponse = await _axios<IApiResponse<TData>>({
        url: firstUrl,
        method,
        data: requestData,
        suppressErrorToast: Boolean(messages?.error),
        skipAuth,
      } as CustomAxiosRequestConfig); // Приведение типа для кастомных полей

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
        } as CustomAxiosRequestConfig); // ИСПРАВЛЕНО: добавлено приведение типа здесь

        const secondBody = secondResponse.data;

        if (!secondBody.success) {
          throw new Error(secondBody.message || "Ошибка при получении дополнительных данных");
        }

        return secondBody.data;
      }

      return firstData;
    },
    [url, method, skipAuth, messages, secondQuery]
  );

  return useMutation({
    mutationFn,
    ...queryOptions,

    onSuccess: (finalData, variables, context) => {
      // Уведомление об успехе (не показываем для GET)
      const successMessage = messages?.success || "Операция успешно выполнена";
      if (successMessage && method !== "GET") {
        toast.success(successMessage);
      }

      messages?.onSuccessCb?.(finalData);
      queryOptions?.onSuccess?.(finalData, variables, context);

      // Инвалидация кэша по ключам
      if (messages?.invalidate) {
        messages.invalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },

    onError: (error: AxiosError, variables, context) => {
      const errorData = error.response?.data as IApiResponse<any> | undefined;
      const message = errorData?.message || error.message || messages?.error || "Произошла ошибка";

      toast.error(message);
      messages?.onErrorCb?.();
      queryOptions?.onError?.(error, variables, context);
    },
  });
};