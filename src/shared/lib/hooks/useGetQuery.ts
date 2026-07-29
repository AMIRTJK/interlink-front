import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { _axios, ApiRoutes } from "@shared/api";
import { tokenControl } from "../tokenControl";
import { useMemo } from "react";

/* ===================== TYPES ===================== */
type TBaseRequest = Record<string, string | number | boolean | undefined | any>;

interface IUseGetQueryOptions<TRequest = TBaseRequest, TResponse = any, TSelect = any> {
  url?: string;
  method?: "GET" | "POST";
  params?: TRequest;
  useToken?: boolean;
  options?: Partial<UseQueryOptions<TResponse, any, TSelect>>;
  preload?: boolean;
  preloadConditional?: string[];
}

export const useGetQuery = <
  TRequest = TBaseRequest,
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
    refetchOnWindowFocus: false,
  });

  const mainEnabled = useMemo(() => {
    if (url) {
      if (!preload) return true;
      if (!preloadQuery.isSuccess || !preloadQuery.data) return false;
      if (!preloadConditional || !preloadConditional.length) return true;
      const current = (preloadQuery.data as { name: string }[]).map((p) => p.name);
      return preloadConditional.every((perm) => current.includes(perm));
    }
    
    if (!url && preload && preloadConditional && preloadConditional.length) {
      if (!preloadQuery.isSuccess || !preloadQuery.data) return false;
      const current = (preloadQuery.data as { name: string }[]).map((p) => p.name);
      return preloadConditional.every((perm) => current.includes(perm));
    }

    return false;
  }, [url, preload, preloadQuery.isSuccess, preloadQuery.data, preloadConditional]);

  const mainQuery = useQuery({
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
      return true as any;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: mainEnabled && queryOptions?.enabled !== false,
  }) as UseQueryResult<TSelect, any>;

  const isMainLoading = mainQuery.isLoading && (mainEnabled && queryOptions?.enabled !== false);
  const isPreloadLoading = preload && preloadQuery.isLoading && tokenControl.get() !== null;
  const loadingState = isMainLoading || isPreloadLoading;

  return {
    data: mainQuery.data,
    refetch: mainQuery.refetch,
    isFetching: mainQuery.isFetching,
    preloadData: preloadQuery.data,
    isLoading: loadingState,
    isPending: loadingState,
    isError: mainQuery.isError || (preload ? preloadQuery.isError : false),
    mainQuery,
    preloadQuery,
  };
};