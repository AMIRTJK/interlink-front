import { ApiRoutes } from "@shared/api";

// Подстановка параметров в маршруты чата. Отдельный модуль, потому что url беседы
// одновременно является ключом кэша (`useGetQuery` собирает ключ как
// [url, params, useToken]) — инвалидация мутаций идёт по тем же строкам.

export const chatUrls = {
  users: ApiRoutes.CHAT_USERS,
  counters: ApiRoutes.CHAT_COUNTERS,
  conversations: ApiRoutes.CHAT_CONVERSATIONS,
  createDirect: ApiRoutes.CHAT_CONVERSATIONS_DIRECT,
  createGroup: ApiRoutes.CHAT_CONVERSATIONS_GROUP,
  presenceHeartbeat: ApiRoutes.CHAT_PRESENCE_HEARTBEAT,

  conversation: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION.replace(":id", String(id)),
  settings: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_SETTINGS.replace(":id", String(id)),
  avatar: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_AVATAR.replace(":id", String(id)),
  members: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_MEMBERS.replace(":id", String(id)),
  member: (id: number, userId: number) =>
    ApiRoutes.CHAT_CONVERSATION_MEMBER.replace(":id", String(id)).replace(
      ":userId",
      String(userId),
    ),
  messages: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_MESSAGES.replace(":id", String(id)),
  media: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_MEDIA.replace(":id", String(id)),
  read: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_READ.replace(":id", String(id)),
  delivered: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_DELIVERED.replace(":id", String(id)),
  typing: (id: number) =>
    ApiRoutes.CHAT_CONVERSATION_TYPING.replace(":id", String(id)),

  message: (messageId: number) =>
    ApiRoutes.CHAT_MESSAGE.replace(":messageId", String(messageId)),
  thread: (messageId: number) =>
    ApiRoutes.CHAT_MESSAGE_THREAD.replace(":messageId", String(messageId)),
  forward: (messageId: number) =>
    ApiRoutes.CHAT_MESSAGE_FORWARD.replace(":messageId", String(messageId)),
  reactions: (messageId: number) =>
    ApiRoutes.CHAT_MESSAGE_REACTIONS.replace(":messageId", String(messageId)),
  reaction: (messageId: number, emoji: string) =>
    ApiRoutes.CHAT_MESSAGE_REACTION.replace(
      ":messageId",
      String(messageId),
    ).replace(":emoji", encodeURIComponent(emoji)),
  pin: (messageId: number) =>
    ApiRoutes.CHAT_MESSAGE_PIN.replace(":messageId", String(messageId)),

  /** Приватный файл вложения. `inline` — просмотр в браузере, иначе скачивание. */
  attachment: (attachmentId: number, inline = false) =>
    `${ApiRoutes.CHAT_ATTACHMENT_DOWNLOAD.replace(":attachmentId", String(attachmentId))}${
      inline ? "?inline=1" : ""
    }`,
} as const;
