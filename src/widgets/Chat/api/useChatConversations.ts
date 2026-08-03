import { useGetQuery } from "@shared/lib";
import type {
  IChatConversation,
  IChatCounters,
  IChatPage,
} from "../model";
import { chatUrls } from "./chatUrls";

// Реестр бесед и счётчики. Источник истины — REST: realtime-события только
// инвалидируют эти запросы (см. useChatRealtime), но сами данными не считаются.

const CONVERSATIONS_PER_PAGE = 50;

/** Ответ приходит либо страницей Laravel, либо голым массивом — нормализуем. */
const toList = <TItem,>(
  payload: IChatPage<TItem> | TItem[] | undefined,
): TItem[] => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : (payload.data ?? []);
};

interface IConversationsParams {
  /** Поиск по названию беседы и содержимому сообщений (на стороне бэкенда). */
  q?: string;
  archived?: 1;
  starred?: 1;
  per_page: number;
}

export const useChatConversations = (search: string, isEnabled: boolean) => {
  const params: IConversationsParams = {
    per_page: CONVERSATIONS_PER_PAGE,
    ...(search ? { q: search } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = useGetQuery<
    IConversationsParams,
    { data?: IChatPage<IChatConversation> | IChatConversation[] }
  >({
    url: chatUrls.conversations,
    params,
    useToken: true,
    options: {
      enabled: isEnabled,
      staleTime: 60 * 1000,
      keepPreviousData: true,
    },
  });

  return {
    conversations: toList(data?.data),
    // useGetQuery отдаёт isLoading как boolean | undefined — приводим к флагу.
    isLoading: Boolean(isLoading),
    isFetching,
    isError,
    refetch,
  };
};

export const useChatCounters = (isEnabled: boolean) => {
  const { data } = useGetQuery<never, { data?: IChatCounters }>({
    url: chatUrls.counters,
    useToken: true,
    options: {
      enabled: isEnabled,
      staleTime: 30 * 1000,
    },
  });

  return (
    data?.data ?? {
      conversations: 0,
      unread_conversations: 0,
      unread_messages: 0,
    }
  );
};

/** Полная карточка беседы: состав участников нужен для шапки и панели информации. */
export const useChatConversation = (conversationId: number | null) => {
  const { data, isLoading } = useGetQuery<never, { data?: IChatConversation }>({
    url: conversationId ? chatUrls.conversation(conversationId) : undefined,
    useToken: true,
    options: {
      enabled: !!conversationId,
      staleTime: 60 * 1000,
    },
  });

  return { conversation: data?.data ?? null, isLoading: Boolean(isLoading) };
};

export { toList as toChatList };
