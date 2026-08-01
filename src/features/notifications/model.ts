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
  | "internal_correspondence_sent"
  | "internal_correspondence_approval_invited"
  | "internal_correspondence_approval_status_changed"
  | "internal_correspondence_approval_completed"
  | "internal_correspondence_signer_invited"
  | "internal_correspondence_signed"
  | "internal_correspondence_signing_completed"
  | "internal_correspondence_assignment_created"
  | "internal_correspondence_assignment_submitted"
  | "internal_correspondence_assignment_reviewed"
  | "internal_correspondence_visor_invited"
  | "internal_correspondence_visor_revoked"
  | "my_file_shared"
  | "my_files_bulk_shared"
  | "my_file_folder_shared";

/** Полезная нагрузка уведомления — ссылка на связанную сущность. */
export interface INotificationData {
  entity?: string;
  entity_id?: number;
  status?: string;
  correspondence_id?: number;
  assignment_id?: number;
  folder_id?: number;
  file_id?: number;
  due_date?: string;
  start_at?: string;
  end_at?: string;
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

/**
 * Событие `.user.notification` из приватного канала `user.{id}`.
 * Это сигнал об изменении: актуальные данные всё равно берём из REST.
 */
export interface IRealtimeNotification {
  id: number;
  user_id: number;
  type: NotificationType | string;
  title: string;
  body: string | null;
  data: INotificationData | null;
  read_at: string | null;
  created_at: string;
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
