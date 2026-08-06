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

const resolveMedia = (
  source: string | null | undefined,
  ctx: IMapContext,
  fallbackName: string,
) => {
  if (!source) return buildInitialsAvatar(fallbackName);
  return ctx.media[source] ?? buildInitialsAvatar(fallbackName);
};

/**
 * Приводит участника к плоскому виду: у вложенной формы (`{ user, role }`)
 * идентификатором участника является id пользователя, а не строки участия.
 */
export const normalizeMember = (member: IChatMember): IChatMember => {
  if (!member?.user) return member;
  return { ...member.user, role: member.role };
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
    return peer?.photo_url ?? peer?.photo_path ?? null;
  }
  if (conversation.avatar_url) return conversation.avatar_url;
  return conversation.avatar_path ? chatUrls.avatar(conversation.id) : null;
};

export const getUserAvatarSource = (
  user: Partial<IChatUser> | null | undefined,
) => user?.photo_url ?? user?.photo_path ?? null;

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
  if (message.is_deleted_for_everyone) return labels.deleted;
  if (message.body) return message.body;
  if (message.kind === "voice") return labels.voiceMessage;
  const [first] = message.attachments ?? [];
  return first?.original_name ?? first?.name ?? labels.attachment;
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
  // запасной вариант на случай, если ручка этот флаг не отдала.
  const isMine =
    message.is_mine ?? (senderId !== null && senderId === ctx.currentUserId);
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
    senderId: isMine ? ME : String(senderId ?? ""),
    senderName: isMine ? ctx.labels.you : (message.sender?.full_name ?? ""),
    senderAvatar: resolveMedia(
      getUserAvatarSource(message.sender),
      ctx,
      message.sender?.full_name ?? "?",
    ),
    text,
    time: formatMessageTime(message.created_at),
    status: message.status === "scheduled" ? "sent" : (message.status ?? "sent"),
    attachment: attachments[0],
    attachments: attachments.length ? attachments : undefined,
    reactions: (message.reactions ?? []).map((reaction) => ({
      emoji: reaction.emoji,
      count: reaction.count ?? 1,
      reactedByMe: Boolean(reaction.reacted_by_me),
    })),
    pinned: Boolean(message.is_pinned),
    replyTo: message.reply_to
      ? {
          id: String(message.reply_to.id),
          senderName: message.reply_to.sender?.full_name ?? "",
          text: describeMessage(message.reply_to, ctx.labels),
        }
      : undefined,
    forwarded: Boolean(message.forwarded ?? message.forwarded_from_id),
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
