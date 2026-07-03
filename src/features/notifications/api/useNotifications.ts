import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type {
  INotification,
  INotificationCounters,
  INotificationsPage,
} from "../model";

interface IEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Ключи, которые нужно инвалидировать после любой мутации над уведомлениями. */
const INVALIDATE_KEYS = [
  ApiRoutes.NOTIFICATIONS,
  ApiRoutes.NOTIFICATIONS_COUNTERS,
];

/**
 * Список уведомлений текущего пользователя. Грузим лениво — только когда
 * поповер открыт (`enabled`), чтобы не дёргать бэкенд на каждой странице.
 */
export const useNotifications = (enabled = true) => {
  const query = useGetQuery<
    Record<string, never>,
    IEnvelope<INotificationsPage>
  >({
    url: ApiRoutes.NOTIFICATIONS,
    options: {
      enabled,
      staleTime: 1000 * 20,
      refetchOnWindowFocus: false,
    },
  });

  const notifications: INotification[] = query.data?.data?.data ?? [];
  return { ...query, notifications };
};

/**
 * Счётчики (unread/total) — нужны для бейджа на колокольчике, поэтому грузятся
 * всегда и периодически обновляются.
 */
export const useNotificationCounters = () => {
  const query = useGetQuery<
    Record<string, never>,
    IEnvelope<INotificationCounters>
  >({
    url: ApiRoutes.NOTIFICATIONS_COUNTERS,
    options: {
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 60,
      refetchOnWindowFocus: true,
    },
  });

  const counters: INotificationCounters = query.data?.data ?? {
    unread: 0,
    total: 0,
  };
  return { ...query, counters };
};

/** PATCH /notifications/read-all — отметить все как прочитанные. */
export const useMarkAllNotificationsRead = () =>
  useMutationQuery<void>({
    url: ApiRoutes.NOTIFICATIONS_READ_ALL,
    method: "PATCH",
    messages: { suppressSuccessToast: true, invalidate: INVALIDATE_KEYS },
  });

/** PATCH /notifications/{id}/read — отметить одно уведомление прочитанным. */
export const useMarkNotificationRead = () =>
  useMutationQuery<{ id: number }>({
    url: (vars) => ApiRoutes.NOTIFICATION_READ.replace(":id", String(vars.id)),
    method: "PATCH",
    transformBody: () => ({}),
    messages: { suppressSuccessToast: true, invalidate: INVALIDATE_KEYS },
  });

/** DELETE /notifications/{id} — удалить уведомление. */
export const useDeleteNotification = () =>
  useMutationQuery<{ id: number }>({
    url: (vars) => ApiRoutes.NOTIFICATION_DELETE.replace(":id", String(vars.id)),
    method: "DELETE",
    transformBody: () => ({}),
    messages: { suppressSuccessToast: true, invalidate: INVALIDATE_KEYS },
  });
