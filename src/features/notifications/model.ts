/** Типы in-app уведомлений личного кабинета. */

export type NotificationType =
  | "personal_task_created"
  | "personal_task_status_changed"
  | "personal_task_overdue"
  | "task_assigned"
  | "task_status_changed"
  | "task_overdue"
  | "event_invited"
  | "event_updated"
  | "event_status_changed"
  | "event_reminder"
  | "internal_correspondence_approval_invited"
  | "internal_correspondence_approval_status_changed"
  | "internal_correspondence_signer_invited"
  | "internal_correspondence_signed";

/** Полезная нагрузка уведомления — ссылка на связанную сущность. */
export interface INotificationData {
  entity?: string;
  entity_id?: number;
  status?: string;
  [key: string]: unknown;
}

export interface INotification {
  id: number;
  /** Один из NotificationType; строка на случай новых типов с бэкенда. */
  type: NotificationType | string;
  title: string;
  body: string | null;
  data: INotificationData | null;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/** Пагинированный ответ GET /notifications (Laravel-пагинация). */
export interface INotificationsPage {
  current_page: number;
  data: INotification[];
}

/** Ответ GET /notifications/counters. */
export interface INotificationCounters {
  unread: number;
  total: number;
}
