import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IUser } from "@entities/login";

interface IUserEnvelope {
  data?: IUser;
}

/**
 * Профиль текущего пользователя для экрана блокировки. Ключ запроса совпадает
 * с useProfileUser в layout, поэтому react-query отдаёт уже загруженные данные
 * без повторного запроса.
 */
export const useLockUser = (): IUser | null => {
  const userId = tokenControl.getUserId();
  const { data } = useGetQuery<undefined, IUserEnvelope>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  });
  return data?.data ?? null;
};
