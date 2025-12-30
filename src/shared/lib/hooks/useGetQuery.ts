import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { _axios } from "@shared/api";
import { tokenControl } from "../tokenControl";

interface IUseGetQueryOptions<
  TRequest = unknown,
  TResponse = unknown,
  TSelect = unknown,
> {
  url: string;
  method?: "GET" | "POST";
  params?: TRequest;
  useToken?: boolean;
  options?: Partial<UseQueryOptions<TResponse, unknown, TSelect>>;
}

export const useGetQuery = <
  TRequest = unknown,
  TResponse = unknown,
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
  } = options;

  const queryFn = useCallback(async () => {
    const headers: Record<string, string> = {};
    if (useToken) {
      const token = tokenControl.get();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    const response = await _axios<TResponse>(url, {
      method,
      [method === "POST" ? "data" : "params"]: params ?? {},
    });

    return response.data;
  }, [method, url, params, useToken]);

  return useQuery({
    queryFn,
    queryKey: [url, params, useToken],
    ...queryOptions,
  }) as UseQueryResult<TSelect, unknown>;
};
