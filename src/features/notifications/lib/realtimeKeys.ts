import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";

/**
 * Ключи кэша, которые обновляются при любом realtime-событии: сам список
 * уведомлений и счётчик на колокольчике.
 */
const ALWAYS_KEYS: readonly string[] = [
  ApiRoutes.NOTIFICATIONS,
  ApiRoutes.NOTIFICATIONS_COUNTERS,
];

/**
 * Разделы, затронутые событием. Тип уведомления с бэкенда — это префикс
 * раздела плюс конкретное действие, поэтому сопоставляем по началу строки.
 */
const KEYS_BY_PREFIX: readonly { prefix: string; keys: readonly string[] }[] = [
  {
    prefix: "internal_correspondence_",
    keys: CORRESPONDENCE_INVALIDATE_KEYS,
  },
  {
    prefix: "personal_task_",
    keys: [
      ApiRoutes.PERSONAL_TASKS,
      ApiRoutes.PERSONAL_TASKS_BOARD,
      ApiRoutes.PERSONAL_ANALYTICS,
    ],
  },
  {
    prefix: "task_",
    keys: [ApiRoutes.GET_TASKS, ApiRoutes.TASKS_BOARD, ApiRoutes.TASKS_STATS],
  },
  {
    prefix: "event_",
    keys: [ApiRoutes.GET_EVENTS, ApiRoutes.PERSONAL_ANALYTICS],
  },
  {
    prefix: "my_file",
    keys: [
      ApiRoutes.MY_FILES,
      ApiRoutes.MY_FILES_SHARED_WITH_ME,
      ApiRoutes.MY_FILE_FOLDERS,
      ApiRoutes.MY_FILE_FOLDERS_SHARED_WITH_ME,
    ],
  },
];

/**
 * Ключи `useGetQuery` (первый элемент queryKey — url), которые нужно
 * инвалидировать после события указанного типа. Неизвестный тип обновляет
 * только уведомления — реестры трогать вслепую незачем.
 */
export const getRealtimeInvalidateKeys = (type: string): string[] => {
  const section = KEYS_BY_PREFIX.find((entry) => type.startsWith(entry.prefix));
  return section ? [...ALWAYS_KEYS, ...section.keys] : [...ALWAYS_KEYS];
};
