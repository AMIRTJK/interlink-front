// Доменные типы чата. Вынесены из дизайн-кода, чтобы их могли переиспользовать
// сервисный слой (api/chatService) и UI-компоненты.
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
};
export type MessageAttachment = {
  name: string;
  size: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'voice';
  preview?: string;
  duration?: number;
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
  senderId: string;
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  attachment?: MessageAttachment;
  reactions?: MessageReaction[];
  pinned?: boolean;
  replyTo?: ReplyPreview;
  forwarded?: boolean;
  threadCount?: number;
  threadMessages?: Message[];
  deleted?: boolean;
  deletedForMe?: boolean;
  scheduled?: boolean;
  scheduledTime?: string;
};
export type EmojiCategory = {
  label: string;
  emojis: string[];
};
export type DrawerTab = 'info' | 'media';
export type PendingFile = {
  name: string;
  size: string;
  type: MessageAttachment['type'];
  preview?: string;
  raw: File;
};
export type LayoutPosition = 'left' | 'right' | 'bottom' | 'top';
