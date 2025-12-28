import { _axios } from "@shared/api";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useCallback } from "react";
import { toast } from "react-toastify";

interface CustomAxiosRequestConfig<T = unknown> extends Omit<
  AxiosRequestConfig<T>,
  "headers"
> {
  suppressErrorToast?: boolean;
  skipAuth?: boolean;
}

// Тип ответа API с success/message/data
export interface IApiResponse<TData = unknown> {
  success: boolean;
  message: string;
  data: TData;
}

// Опции для useMutationQuery
interface IUseMutationQueryOptions<TRequest = unknown, TData = unknown> {
  url: string | ((data: TRequest) => string);
  method: "POST" | "PUT" | "DELETE" | "GET";
  messages?: {
    success?: string;
    error?: string;
    invalidate?: string[];
    onSuccessCb?: (data: TData) => void; // возвращаем уже data
    onErrorCb?: () => void;
  };
  queryParams?: Record<string, unknown>;
  queryOptions?: UseMutationOptions<TData, unknown, TRequest, unknown>;
  skipAuth?: boolean;
}

// Хук useMutationQuery с типизацией
export const useMutationQuery = <TRequest = unknown, TData = unknown>(
  options: IUseMutationQueryOptions<TRequest, TData>
) => {
  const { url, method, messages, queryOptions, skipAuth = false } = options;
  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    async (data: TRequest): Promise<TData> => {
      const requestUrl = typeof url === "function" ? url(data) : url;

      const response = await _axios<IApiResponse<TData>>({
        url: requestUrl,
        method,
        data,
        suppressErrorToast: Boolean(messages?.error),
        skipAuth,
      } as CustomAxiosRequestConfig<TRequest>);

      const body = response.data;

      if (!body.success) {
        throw new Error(body.message || "Ошибка запроса");
      }

      const successMessage = messages?.success || body.message || "Успешно";

      if (successMessage) {
        toast.success(successMessage);
      }

      return body.data; // возвращаем только data
    },
    [url, method, skipAuth, messages]
  );

  return useMutation<TData, AxiosError, TRequest>({
    mutationFn,
    ...queryOptions,

    onSuccess: (data, variables, context) => {
      messages?.onSuccessCb?.(data);
      queryOptions?.onSuccess?.(data, variables, context);

      if (messages?.invalidate) {
        queryClient.invalidateQueries({ queryKey: messages.invalidate });
      }
    },

    onError: (error, variables, context) => {
      const data = error.response?.data as IApiResponse<TData> | undefined;
      const message =
        data?.message || error.message || messages?.error || "Произошла ошибка";

      toast.error(message);
      messages?.onErrorCb?.();
      queryOptions?.onError?.(error, variables, context);
    },
  });
};
