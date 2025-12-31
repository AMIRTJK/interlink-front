import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { _axios, ApiRoutes } from "@shared/api";
import { tokenControl } from "../tokenControl";
import { useMemo } from "react";

/* ===================== TYPES ===================== */
interface IUseGetQueryOptions<TRequest = any, TResponse = any, TSelect = any> {
  url?: string; // Опциональный URL
  method?: "GET" | "POST";
  params?: TRequest;
  useToken?: boolean;
  options?: Partial<UseQueryOptions<TResponse, any, TSelect>>;
  preload?: boolean; // грузим permissions
  preloadConditional?: string[]; // permissions для запуска mainQuery ИЛИ для возврата data: true
}

/* ===================== HOOK ===================== */
export const useGetQuery = <
  TRequest = any,
  TResponse = any,
  TSelect = TResponse,
>(
  options: IUseGetQueryOptions<TRequest, TResponse, TSelect>
) => {
  const {
    url,
    params,
    method = "GET",
    useToken = false,
    options: queryOptions,
    preload,
    preloadConditional,
  } = options;

  /* ---------- PRELOAD QUERY ---------- */
  const preloadQuery = useQuery({
    queryKey: [ApiRoutes.FETCH_PERMISSIONS],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (useToken) {
        const token = tokenControl.get();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const response = await _axios(ApiRoutes.FETCH_PERMISSIONS, {
        method: "GET",
        headers,
      });
      return response.data.data; 
    },
    enabled: preload ? tokenControl.get() !== null : false,
    staleTime: 1000 * 60 * 5, 
  });

  /* ---------- MAIN QUERY ENABLED ---------- */
  const mainEnabled = useMemo(() => {
    // Режим с URL: проверяем условия для запуска запроса
    if (url) {
      if (!preload) return true;
      if (!preloadQuery.isSuccess || !preloadQuery.data) return false;
      if (!preloadConditional || !preloadConditional.length) return true;
      const current = (preloadQuery.data as { name: string }[]).map((p) => p.name);
      return preloadConditional.every((perm) => current.includes(perm));
    }
    
    // Режим "проверка прав": URL нет, но есть условия
    if (!url && preload && preloadConditional && preloadConditional.length) {
      if (!preloadQuery.isSuccess || !preloadQuery.data) return false;
      const current = (preloadQuery.data as { name: string }[]).map((p) => p.name);
      return preloadConditional.every((perm) => current.includes(perm));
    }

    return false; // По умолчанию отключен, если нет URL или условий
  }, [url, preload, preloadQuery.isSuccess, preloadQuery.data, preloadConditional]);

  /* ---------- MAIN QUERY ---------- */
  const mainQuery = useQuery({
    // Если нет URL, ключ базируется на условиях, чтобы разные проверки не конфликтовали
    queryKey: url ? [url, params, useToken] : ["__permission_check__", preloadConditional],
    queryFn: async () => {
      if (url) {
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
      }
      // Если URL нет, возвращаем true как сигнал выполнения условий
      return true as any;
    },
    ...queryOptions,
    enabled: mainEnabled && queryOptions?.enabled !== false,
  }) as UseQueryResult<TSelect, any>;

  // В React Query v4 isLoading = true для отключенных запросов.
  const isMainLoading = mainQuery.isLoading && (mainEnabled && queryOptions?.enabled !== false);
  const isPreloadLoading = preload && preloadQuery.isLoading && tokenControl.get() !== null;
  const loadingState = isMainLoading || isPreloadLoading;

  /* ---------- RETURN ---------- */
  return {
    data: mainQuery.data, // Для "проверки прав" тут будет true
    refetch: mainQuery.refetch,
    isFetching: mainQuery.isFetching,
    preloadData: preloadQuery.data,
    isLoading: loadingState,
    isPending: loadingState, // Для обратной совместимости
    isError: mainQuery.isError || (preload ? preloadQuery.isError : false),
    mainQuery,
    preloadQuery,
  };
};