import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { _axios } from "@shared/api";
import { tokenControl } from "../tokenControl";

/* ===================== TYPES ===================== */
interface ISecondQueryOptions<
  TFirstResult = unknown,
  TSecondRequest = unknown,
  TSecondResponse = unknown
> {
  url: string;
  method?: "GET" | "POST";
  params?: TSecondRequest;
  paramsFromFirst?: (data: TFirstResult) => TSecondRequest;
  /** НОВОЕ: Если true, второй запрос будет ждать успеха первого, даже если данные не передаются */
  shouldWaitFirst?: boolean; 
  options?: Partial<UseQueryOptions<TSecondResponse, unknown, TSecondResponse>>;
}

interface IUseGetQueryOptions<
  TRequest = unknown,
  TResponse = unknown,
  TSelect = unknown,
  TSecondRequest = unknown,
  TSecondResponse = unknown
> {
  url: string;
  method?: "GET" | "POST";
  params?: TRequest;
  useToken?: boolean;
  options?: Partial<UseQueryOptions<TResponse, unknown, TSelect>>;
  secondQuery?: ISecondQueryOptions<TSelect, TSecondRequest, TSecondResponse>;
}

/* ===================== HOOK ===================== */
export const useGetQuery = <
  TRequest = unknown,
  TResponse = unknown,
  TSelect = TResponse,
  TSecondRequest = unknown,
  TSecondResponse = unknown
>(
  options: IUseGetQueryOptions<TRequest, TResponse, TSelect, TSecondRequest, TSecondResponse>
) => {
  const { url, params, method = "POST", useToken = false, options: queryOptions, secondQuery } = options;

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
  }) as UseQueryResult<TSelect, unknown>;

  /* ---------- ЛОГИКА ВТОРОГО ЗАПРОСА ---------- */
  const secondOptions = secondQuery?.options || {};
  const { enabled: manualEnabled, ...restSecondOptions } = secondOptions;

  // Автоматическое определение зависимости:
  // Ждем первый запрос, если:
  // 1. Указан флаг shouldWaitFirst: true
  // 2. ИЛИ передана функция paramsFromFirst
  const isDependent = Boolean(secondQuery?.shouldWaitFirst || secondQuery?.paramsFromFirst);

  const computedEnabled = isDependent 
    ? firstQuery.isSuccess // ждем успешного завершения
    : true;

  // Финальный enabled учитывает ручной ввод пользователя
  const finalEnabled = manualEnabled !== undefined ? manualEnabled : computedEnabled;

  const secondQueryResult = useQuery({
    queryKey: [secondQuery?.url, secondQuery?.params, firstQuery.data, firstQuery.isSuccess],
    queryFn: async () => {
      if (!secondQuery) throw new Error("No config");
      const headers: Record<string, string> = {};
      if (useToken) {
        const token = tokenControl.get();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const finalParams = (secondQuery.paramsFromFirst && firstQuery.data)
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

  return {
    firstQueryData: firstQuery.data,
    secondQueryData: secondQueryResult.data,
    // isLoading объединяет оба запроса (если второй должен быть запущен)
    isLoading: firstQuery.isLoading || (Boolean(secondQuery) && finalEnabled && secondQueryResult.isLoading),
    isError: firstQuery.isError || secondQueryResult.isError,
    firstQuery,
    secondQuery: secondQueryResult,
  };
};