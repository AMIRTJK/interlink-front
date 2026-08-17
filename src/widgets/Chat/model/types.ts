// Доменные типы чата. Вынесены из дизайн-кода, чтобы их могли переиспользовать
// слой данных (api/) и UI-компоненты. Сюда же мапперы (lib/chatMappers) приводят
// ответы бэкенда: компоненты не знают формата API и работают только с этими типами.
import type { TChatMemberRole, TChatMediaType } from "./apiTypes";

/** Беседа в терминах UI. `id` — строковый id беседы с бэкенда. */
export type Contact = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  online: boolean;
  isGroup?: boolean;
  recent?: boolean;
  unreadCount?: number;
  email?: string;
  location?: string;
  joined?: string;
  bio?: string;
  mutualGroups?: string[];
  story?: string;
  /** Должность собеседника в личной беседе. */
  position?: string;
  /** ISO-время последнего появления собеседника в сети. */
  lastSeenAt?: string;
  isStarred?: boolean;
  isMuted?: boolean;
  membersCount?: number;
  /** Роль текущего пользователя в группе — от неё зависят действия с участниками. */
  myRole?: TChatMemberRole;
  /** id собеседника личной беседы (для presence и профиля). */
  peerId?: number;
};
export type MessageAttachment = {
  name: string;
  size: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'voice';
  preview?: string;
  duration?: number;
  durationSeconds?: number;
  url?: string;
  /** MIME из карточки вложения: нужен плееру, ручка отдаёт octet-stream. */
  mimeType?: string;
  /** id вложения на бэкенде — по нему идёт скачивание приватного файла. */
  attachmentId?: number;
};
export type MessageReaction = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
};
export type ReplyPreview = {
  id: string;
  senderName: string;
  text: string;
};
export type Message = {
  id: string;
  clientUuid?: string;
  /**
   * Только у оптимистичного сообщения: наибольший id серверного сообщения,
   * известный на момент отправки. Сопоставлять оптимистичное сообщение с лентой
   * можно лишь начиная с этой границы — иначе новое вложение «схлопывается» с
   * давним письмом того же вида и исчезает с экрана до ответа бэкенда.
   */
  optimisticAfterId?: number;
  senderId: string;
  text: string;
  time: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  attachment?: MessageAttachment;
  /** Все вложения сообщения; `attachment` — первое из них (совместимость). */
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  pinned?: boolean;
  replyTo?: ReplyPreview;
  forwarded?: boolean;
  forwardedSenderName?: string;
  threadCount?: number;
  threadMessages?: Message[];
  deleted?: boolean;
  deletedForMe?: boolean;
  scheduled?: boolean;
  scheduledTime?: string;
  /** Имя отправителя — показываем в группах над чужим сообщением. */
  senderName?: string;
  /** Аватар отправителя (уже разрешённый в blob/data-URL). */
  senderAvatar?: string;
};
export type EmojiCategory = {
  label: string;
  emojis: string[];
};
export type DrawerTab = 'info' | 'media';
export type PendingFile = {
  /** Ключ вложения в очереди: имена не уникальны — из буфера обмена приходят
      снимки экрана с одинаковым `image.png`, а одинаковый файл можно выбрать
      дважды. */
  id: string;
  name: string;
  size: string;
  type: MessageAttachment['type'];
  preview?: string;
  raw: File;
};
export type LayoutPosition = 'left' | 'right' | 'bottom' | 'top';
/**
 * Режим отображения чата:
 * - "page"    — полноценный раздел системы (маршрут /modules/chat), занимает весь экран;
 * - "overlay" — всплывающее окно поверх текущего модуля (плавающая кнопка).
 */
export type TChatVariant = 'page' | 'overlay';

/** Элемент ленты медиа беседы. */
export type ChatMediaItem = {
  id: number;
  name: string;
  size: string;
  type: TChatMediaType;
  /** Разрешённый blob-URL превью (только для изображений). */
  preview?: string;
};
