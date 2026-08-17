import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  IChatCursorPage,
  IChatMessage,
  TChatDeleteScope,
} from "../model";
import { chatUrls } from "./chatUrls";

/** Лента беседы в кэше — курсорные страницы из useChatMessages. */
type TMessagesFeed = InfiniteData<IChatCursorPage<IChatMessage>>;

interface IDeletedTarget {
  conversationId: number;
  messageId: number;
  scope: TChatDeleteScope;
}

/**
 * Удаляет сообщение прямо из кэша ленты.
 *
 * Нужно и своему запросу, и событию `.chat.message.deleted` у остальных
 * участников: инвалидация идёт следом, но перечитывание занимает время, а
 * удалённое сообщение не должно оставаться на экране ни секунды.
 */
export const markMessageDeletedInCache = (
  queryClient: QueryClient,
  { conversationId, messageId }: IDeletedTarget,
) => {
  if (!conversationId || !messageId) return;

  queryClient.setQueriesData<TMessagesFeed>(
    { queryKey: [chatUrls.messages(conversationId)] },
    (feed) => {
      if (!feed) return feed;

      let isChanged = false;
      const pages = feed.pages.map((page) => {
        if (!page.data.some((message) => message.id === messageId)) return page;
        isChanged = true;
        return {
          ...page,
          data: page.data.filter((message) => message.id !== messageId),
        };
      });

      return isChanged ? { ...feed, pages } : feed;
    },
  );

  // Удалённое сообщение может быть ответом в треде: id родителя в событии не
  // приходит, поэтому перечитываем открытый тред целиком — он в кэше один.
  queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].endsWith("/thread"),
  });
};
