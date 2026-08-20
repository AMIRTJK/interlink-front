import { getEnvVar } from "@shared/config";
import type {
  Contact,
  Message,
  MessageAttachment,
  ChatMediaItem,
  IChatAttachment,
  IChatConversation,
  IChatMember,
  IChatMessage,
  IChatUser,
} from "../model";
import { chatUrls } from "../api/chatUrls";
import {
  buildInitialsAvatar,
  formatFileSize,
  formatMessageTime,
  msToSeconds,
  resolveAttachmentType,
} from "./chatFormat";

/** id текущего пользователя в UI-типах: свои сообщения отличаются от чужих по нему. */
export const ME = "me";

/** Тексты, которых нет в ответе бэкенда, приходят из словаря выбранного языка. */
export interface IChatLabels {
  deleted: string;
  deletedForMe: string;
  attachment: string;
  voiceMessage: string;
  you: string;
}

export interface IMapContext {
  currentUserId: number | null;
  /** Загруженные приватные файлы: исходный путь → object-URL (см. useAuthorizedMedia). */
  media: Record<string, string>;
  labels: IChatLabels;
}

export const resolvePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${host}${p}`;
};

export const resolveMedia = (
  source: string | null | undefined,
  ctx: IMapContext,
  fallbackName: string,
) => {
  if (!source) return buildInitialsAvatar(fallbackName);
  if (ctx.media[source]) return ctx.media[source];
  const normalized = source.startsWith("/") ? source : `/${source}`;
  if (ctx.media[normalized]) return ctx.media[normalized];
  if (
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("blob:")
  ) {
    return source;
  }
  return resolvePhotoUrl(source) || buildInitialsAvatar(fallbackName);
};

/**
 * Приводит участника к плоскому виду: у вложенной формы (`{ user, role }`)
 * идентификатором участника является id пользователя, а не строки участия.
 */
export const normalizeMember = (member: IChatMember): IChatMember => {
  if (!member) return member;
  if (!member.user) return member;
  return { ...member, ...member.user, role: member.role };
};

export const normalizeMembers = (members?: IChatMember[] | null): IChatMember[] =>
  (members ?? []).map(normalizeMember);

/** Собеседник личной беседы — единственный участник, кроме меня. */
export const getPeer = (
  conversation: IChatConversation,
  currentUserId: number | null,
): IChatUser | null => {
  if (conversation.type !== "direct") return null;
  const members = normalizeMembers(conversation.members);
  const peer =
    members.find((member) => member.id !== currentUserId) ?? members[0] ?? null;
  return peer ? { ...peer, full_name: peer.full_name ?? "" } : null;
};

/**
 * Откуда брать картинку беседы. Возвращает `null`, если аватара нет —
 * тогда рисуется заглушка с инициалами.
 */
export const getConversationAvatarSource = (
  conversation: IChatConversation,
  currentUserId: number | null,
): string | null => {
  if (conversation.type === "direct") {
    const peer = getPeer(conversation, currentUserId);
    return getUserAvatarSource(peer);
  }
  if (conversation.avatar_url) return conversation.avatar_url;
  if (conversation.avatar_path) return conversation.avatar_path;
  const cAny = conversation as unknown as Record<string, unknown>;
  if (typeof cAny.avatar === "string") return cAny.avatar;
  if (typeof cAny.photo_url === "string") return cAny.photo_url;
  if (typeof cAny.photo_path === "string") return cAny.photo_path;
  return conversation.avatar_path ? chatUrls.avatar(conversation.id) : null;
};

export const getUserAvatarSource = (
  user: Partial<IChatUser & { avatar?: string | null; avatar_url?: string | null; avatar_path?: string | null; photo?: string | null }> | null | undefined,
) => {
  if (!user) return null;
  return (
    user.photo_url ??
    user.photo_path ??
    user.avatar_url ??
    user.avatar_path ??
    user.avatar ??
    user.photo ??
    null
  );
};

/** Превью вложения в изображении — приватный файл, отданный inline. */
export const getAttachmentPreviewSource = (attachment: IChatAttachment) =>
  resolveAttachmentType(attachment.type, attachment.mime_type) === "image"
    ? chatUrls.attachment(attachment.id, true)
    : null;

/** Короткое описание последнего сообщения для списка бесед. */
export const describeMessage = (
  message: IChatMessage | null | undefined,
  labels: IChatLabels,
): string => {
  if (!message) return "";
  if (message.is_deleted_for_everyone || message.is_deleted_for_me) return "";

  const [firstAtt] = message.attachments ?? [];
  if (firstAtt) {
    const type = resolveAttachmentType(firstAtt.type, firstAtt.mime_type);
    const icon = type === "image" ? "📷 " : type === "voice" ? "🎤 " : "📁 ";
    if (message.body) {
      return `${icon}${message.body}`;
    }
    return `${icon}${firstAtt.original_name ?? firstAtt.name ?? (type === "voice" ? labels.voiceMessage : labels.attachment)}`;
  }

  if (message.body) return message.body;
  if (message.kind === "voice") return `🎤 ${labels.voiceMessage}`;
  return labels.attachment;
};

export const mapAttachment = (
  attachment: IChatAttachment,
  ctx: IMapContext,
): MessageAttachment => {
  const type = resolveAttachmentType(attachment.type, attachment.mime_type);
  const previewSource = getAttachmentPreviewSource(attachment);

  return {
    attachmentId: attachment.id,
    name:
      attachment.original_name ??
      attachment.name ??
      (type === "voice" ? ctx.labels.voiceMessage : ctx.labels.attachment),
    size: formatFileSize(attachment.size),
    type,
    preview: previewSource ? ctx.media[previewSource] : undefined,
    mimeType: attachment.mime_type ?? undefined,
    duration: msToSeconds(attachment.duration_ms),
  };
};

export const mapMessage = (message: IChatMessage, ctx: IMapContext): Message => {
  const senderId = message.sender_id ?? message.sender?.id ?? null;
  // Своё сообщение определяет бэкенд (`is_mine`); сравнение с текущим id —
  const isMine =
    Boolean(message.is_mine) ||
    (senderId != null &&
      ctx.currentUserId != null &&
      String(senderId) === String(ctx.currentUserId));
  const attachments = (message.attachments ?? []).map((item) =>
    mapAttachment(item, ctx),
  );

  const isDeletedForEveryone = Boolean(message.is_deleted_for_everyone);
  const isDeletedForMe = Boolean(message.is_deleted_for_me);
  const text = isDeletedForEveryone
    ? ctx.labels.deleted
    : isDeletedForMe
      ? ctx.labels.deletedForMe
      : (message.body ?? "");

  return {
    id: String(message.id),
    clientUuid: message.client_uuid ?? undefined,
    senderId: isMine ? ME : String(senderId ?? ""),
    senderName: isMine ? ctx.labels.you : (message.sender?.full_name ?? ""),
    senderAvatar: resolveMedia(
      getUserAvatarSource(message.sender),
      ctx,
      message.sender?.full_name ?? "?",
    ),
    text,
    time: formatMessageTime(message.created_at),
    createdAt: message.created_at ?? message.sent_at ?? undefined,
    status: message.status === "scheduled" ? "sent" : (message.status ?? "sent"),
    attachment: attachments[0],
    attachments: attachments.length ? attachments : undefined,
    reactions: (message.reactions ?? []).map((reaction) => ({
      emoji: reaction.emoji,
      count: reaction.count ?? 1,
      reactedByMe: Boolean(reaction.reacted_by_me),
    })),
    pinned: Boolean(message.is_pinned),
    replyTo:
      message.reply_to &&
      !message.reply_to.is_deleted_for_everyone &&
      !message.reply_to.is_deleted_for_me
        ? {
            id: String(message.reply_to.id),
            senderName: message.reply_to.sender?.full_name ?? "",
            text: describeMessage(message.reply_to, ctx.labels),
          }
        : undefined,
    forwarded: Boolean(
      message.forwarded ??
        message.forwarded_from_id ??
        message.forwarded_from ??
        (message as unknown as Record<string, unknown>).forwarded_from_name,
    ),
    forwardedSenderName:
      (message.forwarded_from as { sender?: IChatUser } | undefined)?.sender?.full_name ??
      (message.forwarded_from as IChatUser | undefined)?.full_name ??
      ((message as unknown as Record<string, unknown>).forwarded_from_user as IChatUser | undefined)?.full_name ??
      ((message as unknown as Record<string, unknown>).forwarded_from_name as string | undefined) ??
      ((message as unknown as Record<string, unknown>).forwarded_sender_name as string | undefined) ??
      ((message as unknown as Record<string, unknown>).forward_sender_name as string | undefined) ??
      undefined,
    threadCount: message.thread_count ?? 0,
    deleted: isDeletedForEveryone,
    deletedForMe: isDeletedForMe,
    scheduled: message.status === "scheduled",
    scheduledTime: message.scheduled_at
      ? formatMessageTime(message.scheduled_at)
      : undefined,
  };
};

export const mapConversation = (
  conversation: IChatConversation,
  ctx: IMapContext,
): Contact => {
  const peer = getPeer(conversation, ctx.currentUserId);
  const name =
    conversation.display_title ??
    conversation.title ??
    peer?.full_name ??
    `#${conversation.id}`;

  return {
    id: String(conversation.id),
    name,
    avatar: resolveMedia(
      getConversationAvatarSource(conversation, ctx.currentUserId),
      ctx,
      name,
    ),
    lastMessage: describeMessage(conversation.last_message, ctx.labels),
    lastMessageAt:
      conversation.last_message?.created_at ?? conversation.updated_at ?? undefined,
    online: Boolean(peer?.is_online),
    isGroup: conversation.type === "group",
    unreadCount: conversation.unread_count ?? 0,
    position: peer?.position ?? undefined,
    lastSeenAt: peer?.last_seen_at ?? undefined,
    isStarred: Boolean(conversation.is_starred),
    isMuted: Boolean(conversation.is_muted),
    membersCount: conversation.members_count ?? conversation.members?.length,
    myRole: conversation.my_role,
    peerId: peer?.id,
  };
};

/** Сотрудник в списке выбора — та же карточка контакта, но без беседы. */
export const mapUserToContact = (user: IChatUser, ctx: IMapContext): Contact => ({
  id: String(user.id),
  name: user.full_name,
  avatar: resolveMedia(getUserAvatarSource(user), ctx, user.full_name),
  lastMessage: user.position ?? "",
  online: Boolean(user.is_online),
  position: user.position ?? undefined,
  lastSeenAt: user.last_seen_at ?? undefined,
  peerId: user.id,
});

export const mapMediaItem = (
  attachment: IChatAttachment,
  ctx: IMapContext,
): ChatMediaItem => {
  const previewSource = getAttachmentPreviewSource(attachment);
  return {
    id: attachment.id,
    name: attachment.original_name ?? attachment.name ?? ctx.labels.attachment,
    size: formatFileSize(attachment.size),
    type: resolveAttachmentType(attachment.type, attachment.mime_type),
    preview: previewSource ? ctx.media[previewSource] : undefined,
  };
};

/**
 * Проверяет, совпадает ли оптимистичное сообщение с реальным сообщением с сервера.
 * Поддерживает текст, файлы, фото и голосовые сообщения.
 */
export const isOptimisticMatch = (opt: Message, server: Message): boolean => {
  // 1. Прямое совпадение по clientUuid
  if (opt.clientUuid && server.clientUuid && opt.clientUuid === server.clientUuid) {
    return true;
  }

  // 2. Чужие сообщения не могут быть нашими оптимистичными
  if (server.senderId !== ME) {
    return false;
  }

  // 3. Дальше идут эвристики по содержимому — они нужны, когда бэкенд не вернул
  //    client_uuid. Сравнивать по ним можно только с сообщениями, появившимися
  //    ПОСЛЕ отправки: у вложений совпадение слишком широкое (любое своё
  //    голосовое, любой свой файл без подписи), и новое сообщение схлопывалось
  //    с давним — то есть исчезало из ленты, не дождавшись ответа бэкенда.
  //    Id у сообщений возрастающие, поэтому граница считается по ним.
  const serverId = Number(server.id);
  if (
    opt.optimisticAfterId !== undefined &&
    Number.isFinite(serverId) &&
    serverId <= opt.optimisticAfterId
  ) {
    return false;
  }

  // 4. Голосовые сообщения (audio / voice)
  const isOptVoice =
    opt.attachment?.type === "voice" ||
    opt.attachments?.some((a) => a.type === "voice");
  const isServerVoice =
    server.attachment?.type === "voice" ||
    server.attachments?.some((a) => a.type === "voice");
  if (isOptVoice && isServerVoice) {
    return true;
  }

  // 5. Вложения (файлы, фото, документы)
  const optAtts = opt.attachments ?? (opt.attachment ? [opt.attachment] : []);
  const serverAtts = server.attachments ?? (server.attachment ? [server.attachment] : []);
  if (optAtts.length > 0 && serverAtts.length > 0) {
    const hasMatchingName = optAtts.some((oa) =>
      serverAtts.some((sa) => sa.name && oa.name && sa.name === oa.name),
    );
    if (hasMatchingName) return true;

    // Если имена изменены бэкендом, но совпадает текст (или оба без текста)
    const optText = (opt.text ?? "").trim();
    const serverText = (server.text ?? "").trim();
    if (optText === serverText) return true;
  }

  // 6. Текстовые сообщения
  const optText = (opt.text ?? "").trim();
  const serverText = (server.text ?? "").trim();
  if (optText && serverText && optText === serverText) {
    return true;
  }

  return false;
};

