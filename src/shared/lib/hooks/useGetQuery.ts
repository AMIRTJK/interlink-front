// V1-с одним запросом

// import {
//   useQuery,
//   UseQueryOptions,
//   UseQueryResult,
// } from "@tanstack/react-query";
// import { useCallback } from "react";
// import { _axios } from "@shared/api";
// import { tokenControl } from "../tokenControl";

// interface IUseGetQueryOptions<
//   TRequest = unknown,
//   TResponse = unknown,
//   TSelect = unknown,
// > {
//   url: string;
//   method?: "GET" | "POST";
//   params?: TRequest;
//   useToken?: boolean;
//   options?: Partial<UseQueryOptions<TResponse, unknown, TSelect>>;
// }

// export const useGetQuery = <
//   TRequest = unknown,
//   TResponse = unknown,
//   TSelect = TResponse,
// >(
//   options: IUseGetQueryOptions<TRequest, TResponse, TSelect>
// ) => {
//   const {
//     url,
//     params,
//     method = "POST",
//     useToken = false,
//     options: queryOptions,
//   } = options;

//   const queryFn = useCallback(async () => {
//     const headers: Record<string, string> = {};
//     if (useToken) {
//       const token = tokenControl.get();
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     const response = await _axios<TResponse>(url, {
//       method,
//       [method === "POST" ? "data" : "params"]: params ?? {},
//     });

//     return response.data;
//   }, [method, url, params, useToken]);

//   return useQuery({
//     queryFn,
//     queryKey: [url, params, useToken],
//     ...queryOptions,
//   }) as UseQueryResult<TSelect, unknown>;
// };

// V2-с двумя запросами
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { _axios } from "@shared/api";
import { tokenControl } from "../tokenControl";

/* ===================== TYPES ===================== */
interface ISecondQueryOptions<
  TFirstResult = any,
  TSecondRequest = any,
  TSecondResponse = any,
> {
  url: string;
  method?: "GET" | "POST";
  params?: TSecondRequest;
  paramsFromFirst?: (data: TFirstResult) => TSecondRequest;
  /** Если true, второй запрос будет ждать успеха первого */
  shouldWaitFirst?: boolean;
  options?: Partial<UseQueryOptions<TSecondResponse, any, TSecondResponse>>;
}

interface IUseGetQueryOptions<
  TRequest = any,
  TResponse = any,
  TSelect = any,
  TSecondRequest = any,
  TSecondResponse = any,
> {
  url: string;
  method?: "GET" | "POST";
  params?: TRequest;
  useToken?: boolean;
  options?: Partial<UseQueryOptions<TResponse, any, TSelect>>;
  secondQuery?: ISecondQueryOptions<TSelect, TSecondRequest, TSecondResponse>;
}

/* ===================== HOOK ===================== */
export const useGetQuery = <
  TRequest = any,
  TResponse = any,
  TSelect = any,
  TSecondRequest = any,
  TSecondResponse = any,
>(
  options: IUseGetQueryOptions<
    TRequest,
    TResponse,
    TSelect,
    TSecondRequest,
    TSecondResponse
  >
) => {
  const {
    url,
    params,
    method = "GET",
    useToken = false,
    options: queryOptions,
    secondQuery,
  } = options;

  /* ---------- ПЕРВЫЙ ЗАПРОС ---------- */
  const firstQuery = useQuery({
    queryKey: [url, params, useToken],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (useToken) {
        const token = tokenControl.get();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await _axios<TResponse>(url, {
        method,
        [method === "POST" ? "data" : "params"]: params ?? {},
        headers,
      });
      return response.data;
    },
    ...queryOptions,
  }) as UseQueryResult<TSelect, any>;

  /* ---------- ЛОГИКА ВТОРОГО ЗАПРОСА ---------- */
  const secondOptions = secondQuery?.options || {};
  const { enabled: manualEnabled, ...restSecondOptions } = secondOptions;

  const isDependent = Boolean(
    secondQuery?.shouldWaitFirst || secondQuery?.paramsFromFirst
  );

  const computedEnabled = isDependent ? firstQuery.isSuccess : true;

  const finalEnabled =
    manualEnabled !== undefined ? manualEnabled : computedEnabled;

  const secondQueryResult = useQuery({
    queryKey: [
      secondQuery?.url,
      secondQuery?.params,
      firstQuery.data,
      firstQuery.isSuccess,
    ],
    queryFn: async () => {
      if (!secondQuery) throw new Error("No config");
      const headers: Record<string, string> = {};
      if (useToken) {
        const token = tokenControl.get();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const finalParams =
        secondQuery.paramsFromFirst && firstQuery.data
          ? secondQuery.paramsFromFirst(firstQuery.data)
          : secondQuery.params;

      const response = await _axios<TSecondResponse>(secondQuery.url, {
        method: secondQuery.method ?? "POST",
        [secondQuery.method === "POST" ? "data" : "params"]: finalParams ?? {},
        headers,
      });
      return response.data;
    },
    ...restSecondOptions,
    enabled: Boolean(secondQuery) && !!finalEnabled,
  });

  /* ---------- ВОЗВРАЩАЕМ ДАННЫЕ ---------- */
  return {
    // 1. Обратная совместимость для обычных вызовов (SelectField, Table и др.)
    data: firstQuery.data,
    refetch: firstQuery.refetch,
    isFetching: firstQuery.isFetching,

    // 2. Новые поля для цепочек запросов (ModuleMenu)
    firstQueryData: firstQuery.data,
    secondQueryData: secondQueryResult.data,

    // 3. Общие статусы
    isPending:
      firstQuery.isLoading ||
      (Boolean(secondQuery) && finalEnabled && secondQueryResult.isLoading),
    isError: firstQuery.isError || secondQueryResult.isError,

    // 4. Полные объекты для продвинутого использования
    firstQuery,
    secondQuery: secondQueryResult,
  };
};
