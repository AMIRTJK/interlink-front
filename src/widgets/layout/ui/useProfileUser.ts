import { tokenControl, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";

/**
 * Данные текущего пользователя для шапки и боковой панели личного кабинета.
 * Запрос дедуплицируется react-query (один и тот же ключ), поэтому хук можно
 * безопасно вызывать в нескольких местах (Header + Sidebar) без лишних запросов.
 */
export const useProfileUser = () => {
  const userId = tokenControl.getUserId();
  const { data: userResponse } = useGetQuery<{ data: IUser }>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  });

  const userData = (userResponse as { data?: IUser } | undefined)?.data ?? null;
  const userSubtitle =
    [userData?.position, userData?.organization?.name]
      .filter(Boolean)
      .join(" • ") || "—";

  return {
    userData,
    userName: userData?.full_name || "—",
    userSubtitle,
    userPhoto: userData?.photo_path || undefined,
  };
};
