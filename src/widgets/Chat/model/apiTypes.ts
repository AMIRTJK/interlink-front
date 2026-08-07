// Контракты бэкенда корпоративного чата (/api/v1/chat/**).
// Поля, которые ручки отдают не всегда (разные ресурсы отдают разный набор),
// помечены необязательными — читаем их через опциональные цепочки.

/** Тип содержимого сообщения при отправке. */
export type TChatMessageKind = "text" | "attachment" | "voice";

/** Жизненный цикл сообщения на сервере. */
export type TChatMessageStatus = "scheduled" | "sent" | "delivered" | "read";

/** Фильтр вложений в ленте медиа и в списке сообщений. */
export type TChatMediaType = "image" | "video" | "audio" | "voice" | "file";

export type TChatConversationType = "direct" | "group";

/** Роль участника внутри групповой беседы. */
export type TChatMemberRole = "owner" | "admin" | "member";

export interface IChatUser {
  id: number;
  full_name: string;
  position?: string | null;
  photo_path?: string | null;
  photo_url?: string | null;
  is_online?: boolean;
  last_seen_at?: string | null;
}

/**
 * Участник беседы. Часть ручек отдаёт его плоско (поля пользователя + role),
 * часть — вложенно (`{ user: {...}, role }`), поэтому поля пользователя здесь
 * необязательные, а приводит форму к плоской `normalizeMember`.
 */
export interface IChatMember extends Partial<IChatUser> {
  id: number;
  role?: TChatMemberRole;
  user?: IChatUser | null;
  user_id?: number;
}

export interface IChatAttachment {
  id: number;
  name?: string | null;
  original_name?: string | null;
  size?: number | null;
  mime_type?: string | null;
  type?: TChatMediaType | null;
  duration_ms?: number | null;
}

export interface IChatReaction {
  emoji: string;
  count?: number;
  reacted_by_me?: boolean;
}

export interface IChatMessage {
  id: number;
  conversation_id?: number;
  client_uuid?: string | null;
  sender_id?: number | null;
  sender?: IChatUser | null;
  /** Признак «моё сообщение» считает бэкенд — на него и опираемся. */
  is_mine?: boolean;
  body?: string | null;
  kind?: TChatMessageKind;
  status?: TChatMessageStatus;
  created_at?: string | null;
  sent_at?: string | null;
  edited_at?: string | null;
  scheduled_at?: string | null;
  attachments?: IChatAttachment[];
  reactions?: IChatReaction[];
  reply_to?: IChatMessage | null;
  reply_to_id?: number | null;
  thread_parent_id?: number | null;
  thread_count?: number;
  forwarded?: boolean;
  forwarded_from_id?: number | null;
  forwarded_from?: IChatUser | IChatMessage | { sender?: IChatUser; body?: string } | null;
  is_pinned?: boolean;
  is_deleted_for_me?: boolean;
  is_deleted_for_everyone?: boolean;
}

/** Ответ ручки треда: родительское сообщение и курсорная страница ответов. */
export interface IChatThread {
  parent?: IChatMessage | null;
  messages?: IChatCursorPage<IChatMessage> | IChatMessage[];
}

export interface IChatConversation {
  id: number;
  type: TChatConversationType;
  title?: string | null;
  display_title?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
  my_role?: TChatMemberRole;
  is_starred?: boolean;
  is_muted?: boolean;
  muted_until?: string | null;
  is_archived?: boolean;
  unread_count?: number;
  members_count?: number;
  members?: IChatMember[];
  last_message?: IChatMessage | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface IChatCounters {
  conversations: number;
  unread_conversations: number;
  unread_messages: number;
}

/** Курсорная страница сообщений: следующую берём из next_cursor. */
export interface IChatCursorPage<TItem> {
  data: TItem[];
  next_cursor?: string | null;
  prev_cursor?: string | null;
}

/** Обычная страничная выдача Laravel (список бесед, сотрудники, медиа). */
export interface IChatPage<TItem> {
  data: TItem[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

/* ===================== ПОЛЕЗНАЯ НАГРУЗКА REALTIME-СОБЫТИЙ ===================== */

export interface IChatMessageEvent {
  conversation_id: number;
  message?: IChatMessage;
  message_id?: number;
  user_id?: number;
}

export interface IChatTypingEvent {
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface IChatPresenceEvent {
  user_id: number;
  is_online: boolean;
  last_seen_at?: string | null;
}

export interface IChatConversationEvent {
  conversation_id?: number;
  conversation?: IChatConversation;
}
