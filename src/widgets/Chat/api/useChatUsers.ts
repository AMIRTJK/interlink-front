import { useGetQuery } from "@shared/lib";
import type { IChatPage, IChatUser } from "../model";
import { chatUrls } from "./chatUrls";
import { toChatList } from "./useChatConversations";

const USERS_PER_PAGE = 30;

/**
 * Сотрудники организации для создания чата и добавления в группу.
 * Поиск идёт на бэкенде (ФИО и должность), поэтому строку сюда передают уже
 * с debounce — иначе запрос уходит на каждый символ.
 */
export const useChatUsers = (search: string, isEnabled: boolean) => {
  const params = {
    per_page: USERS_PER_PAGE,
    ...(search ? { q: search } : {}),
  };

  const { data, isLoading, isError } = useGetQuery<
    typeof params,
    { data?: IChatPage<IChatUser> | IChatUser[] }
  >({
    url: chatUrls.users,
    params,
    useToken: true,
    options: {
      enabled: isEnabled,
      staleTime: 60 * 1000,
      keepPreviousData: true,
    },
  });

  return { users: toChatList(data?.data), isLoading: Boolean(isLoading), isError };
};
