import { useRealtimeNotifications } from "@features/notifications";

/**
 * Точка монтирования realtime-подписки на уведомления. Ничего не рисует:
 * событие из Reverb только инвалидирует кэш, интерфейс обновляют обычные
 * запросы. Должен быть смонтирован ровно один раз внутри QueryClientProvider.
 */
export const RealtimeNotifications = () => {
  useRealtimeNotifications();
  return null;
};
