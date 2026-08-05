import { useGetQuery } from "@shared/lib";
import type { IChatAttachment, IChatPage, TChatMediaType } from "../model";
import { chatUrls } from "./chatUrls";
import { toChatList } from "./useChatConversations";

/**
 * Вложения беседы для вкладки «Медиа».
 * Грузится только когда вкладка открыта: панель информации по умолчанию скрыта,
 * а лента медиа тянет за собой ещё и загрузку превью приватных файлов.
 */
export const useConversationMedia = (
  conversationId: number | null,
  type: TChatMediaType | null,
  isEnabled: boolean,
) => {
  const params = type ? { type } : undefined;

  const { data, isLoading, isError } = useGetQuery<
    typeof params,
    { data?: IChatPage<IChatAttachment> | IChatAttachment[] }
  >({
    url: conversationId ? chatUrls.media(conversationId) : undefined,
    params,
    useToken: true,
    options: {
      enabled: isEnabled && !!conversationId,
      staleTime: 60 * 1000,
    },
  });

  return {
    attachments: toChatList(data?.data),
    isLoading: Boolean(isLoading && isEnabled),
    isError,
  };
};
