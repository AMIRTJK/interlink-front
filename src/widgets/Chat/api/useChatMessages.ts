import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { _axios } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import type { IChatCursorPage, IChatMessage, IChatThread } from "../model";
import { chatUrls } from "./chatUrls";

const MESSAGES_PER_PAGE = 40;

/**
 * Лента сообщений беседы.
 *
 * Единственное место, где вместо `useGetQuery` берётся `useInfiniteQuery`:
 * бэкенд отдаёт сообщения курсором (`next_cursor`), а не номером страницы, и
 * докачка старых сообщений должна складываться в тот же кэш, а не в useState.
 * Ключ собран как у `useGetQuery` ([url, params, useToken]), поэтому мутации
 * инвалидируют ленту по обычному url беседы.
 */
const normalizeCursorPage = (
  payload: unknown,
): IChatCursorPage<IChatMessage> => {
  const root = payload as
    | (IChatCursorPage<IChatMessage> & { data?: unknown })
    | undefined;

  const page = (
    Array.isArray(root?.data) ? root : root?.data
  ) as IChatCursorPage<IChatMessage> | undefined;

  return {
    data: page?.data ?? [],
    next_cursor: page?.next_cursor ?? null,
  };
};

export const useChatMessages = (conversationId: number | null) => {
  const url = conversationId ? chatUrls.messages(conversationId) : "";
  const params = useMemo(() => ({ per_page: MESSAGES_PER_PAGE }), []);

  const query = useInfiniteQuery({
    queryKey: [url, params, true],
    queryFn: async (context) => {
      const cursor = context.pageParam as string | undefined;
      const response = await _axios.get(url, {
        params: { ...params, ...(cursor ? { cursor } : {}) },
      });
      return normalizeCursorPage(response.data);
    },
    getNextPageParam: (lastPage: IChatCursorPage<IChatMessage>) =>
      lastPage.next_cursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Страницы приходят от новых к старым; лента рисуется по возрастанию id.
  const messages = useMemo(() => {
    const byId = new Map<number, IChatMessage>();
    query.data?.pages.forEach((page) =>
      page.data.forEach((message) => byId.set(message.id, message)),
    );
    return Array.from(byId.values()).sort((a, b) => a.id - b.id);
  }, [query.data]);

  return {
    messages,
    isLoading: query.isLoading && !!conversationId,
    isError: query.isError,
    hasOlder: Boolean(query.hasNextPage),
    isLoadingOlder: query.isFetchingNextPage,
    loadOlder: query.fetchNextPage,
    refetchMessages: query.refetch,
  };
};

/**
 * Ответы в треде конкретного сообщения — грузим только при открытой панели.
 * Ручка отдаёт `{ parent, messages: { data, next_cursor } }`, то есть ответы
 * лежат на уровень глубже, чем в остальных списках.
 */
export const useChatThread = (messageId: number | null) => {
  const { data, isLoading } = useGetQuery<never, { data?: IChatThread }>({
    url: messageId ? chatUrls.thread(messageId) : undefined,
    useToken: true,
    options: {
      enabled: !!messageId,
      staleTime: 30 * 1000,
    },
  });

  const replies = data?.data?.messages;
  const messages = Array.isArray(replies) ? replies : (replies?.data ?? []);

  return {
    threadMessages: messages,
    threadParent: data?.data?.parent ?? null,
    isLoading: Boolean(isLoading && messageId),
  };
};
