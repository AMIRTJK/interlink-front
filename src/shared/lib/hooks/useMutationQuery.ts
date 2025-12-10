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

interface IUseMutationQueryOptions<TRequest = unknown, TResponse = unknown> {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "GET";
  messages?: {
    success?: string;
    error?: string;
    invalidate?: string[];
    onSuccessCb?: (data: TResponse) => void;
    onErrorCb?: () => void;
  };
  queryParams?: Record<string, unknown>;
  queryOptions?: UseMutationOptions<TResponse, unknown, TRequest, unknown>;
  skipAuth?: boolean;
}

export const useMutationQuery = <TRequest = unknown, TResponse = unknown>(
  options: IUseMutationQueryOptions<TRequest, TResponse>
) => {
  const { url, method, messages, queryOptions, skipAuth = false } = options;

  const queryClient = useQueryClient();

  const mutationFn = useCallback(
    async (data: TRequest) => {
      const response = await _axios<TResponse>({
        url,
        method,
        data,
        suppressErrorToast: Boolean(messages?.error),
        skipAuth: skipAuth,
      } as CustomAxiosRequestConfig<TRequest>);

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        const data = response.data as { message?: string };
        throw new Error(data.message || "Ошибка запроса");
      }
    },
    [url, method, skipAuth, messages]
  );

  return useMutation({
    mutationFn,
    ...queryOptions,
    onSuccess: (data, variables, context) => {
      if (messages?.success) {
        toast.success(messages.success);
      }
      messages?.onSuccessCb?.(data);

      queryOptions?.onSuccess?.(data, variables, context);

      if (messages?.invalidate) {
        queryClient.invalidateQueries({ queryKey: messages.invalidate });
        queryClient.refetchQueries({ queryKey: messages.invalidate });
      }
    },
    onError: (error: AxiosError, variables, context) => {
      let errorMessage = "Произошла ошибка";

      const data = error.response?.data as
        | { message?: string; Message?: string }
        | undefined;

      if (data?.Message) {
        errorMessage = data.Message;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (!messages?.error) {
        toast.error(errorMessage);
      }

      queryOptions?.onError?.(error, variables, context);
    },
  });
};
