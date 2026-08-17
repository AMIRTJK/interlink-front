import { useCallback, useEffect, useMemo, useState } from "react";
import { tokenControl, useCurrentUser, type ICurrentUserPermissions } from "@shared/lib";
import {
  useChatConversation,
  useChatConversations,
  useChatCounters,
  useChatMessages,
  useChatRealtime,
  useChatSignals,
  useChatThread,
  useConversationActions,
  useMessageActions,
} from "../api";
import type { Contact, IChatMessageEvent, Message } from "../model";
import { ME } from "../model";
import {
  getAttachmentPreviewSource,
  getConversationAvatarSource,
  getUserAvatarSource,
  isOptimisticMatch,
  mapConversation,
  mapMessage,
  normalizeMembers,
  resolveMedia,
  type IChatLabels,
  type IMapContext,
} from "./chatMappers";
import { useAuthorizedMedia } from "./useAuthorizedMedia";

// ─── Владелец серверных данных чата ──────────────────────────────────────────
// Собирает беседы, ленту сообщений и действия над ними, приводит ответы к
// доменным типам UI и подключает realtime. Компоненты получают уже готовые
// Contact/Message и не знают ни про курсоры, ни про формат бэкенда.

interface IChatDataOptions {
  /** Чат виден пользователю: закрытая модалка ничего не грузит. */
  isEnabled: boolean;
  /** Строка поиска бесед (приходит с debounce). */
  search: string;
  labels: IChatLabels;
  /** Открытый тред — id родительского сообщения. */
  threadMessageId: number | null;
}

const toId = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Превью и запись оптимистичного сообщения показываются из локального blob-URL:
 * когда сообщение уходит из списка (пришло с сервера либо отправка не удалась),
 * ссылку освобождаем, иначе файл остаётся в памяти до перезагрузки страницы.
 * Повторный вызов безопасен — `revokeObjectURL` на освобождённой ссылке ничего
 * не делает.
 */
const revokeOptimisticPreviews = (msg: Message) => {
  const attachments = msg.attachments ?? (msg.attachment ? [msg.attachment] : []);
  attachments.forEach((attachment) => {
    [attachment.preview, attachment.url].forEach((value) => {
      if (value?.startsWith("blob:")) URL.revokeObjectURL(value);
    });
  });
};

const LAST_ACTIVE_CHAT_KEY = "chat:last-active-conversation-id";

const readLastActiveConversationId = (): number | null => {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_CHAT_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
};

export const useChatData = ({
  isEnabled,
  search,
  labels,
  threadMessageId,
}: IChatDataOptions) => {
  const { user } = useCurrentUser();
  const storedUserId = Number(tokenControl.getUserId());
  const currentUserId =
    storedUserId > 0 ? storedUserId : (user?.id ?? null);
  // organization_id нужен для канала присутствия и приходит тем же auth/me.
  const organizationId =
    (user as (ICurrentUserPermissions & { organization_id?: number }) | undefined)
      ?.organization_id ?? null;

  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    readLastActiveConversationId,
  );

  useEffect(() => {
    if (activeConversationId) {
      try {
        localStorage.setItem(LAST_ACTIVE_CHAT_KEY, String(activeConversationId));
      } catch (e) {
        console.error("Не удалось сохранить последний открытый чат:", e);
      }
    }
  }, [activeConversationId]);

  const { conversations, isLoading: isLoadingChats, isError: isChatsError } =
    useChatConversations(search, isEnabled);

  // Восстанавливаем последний открытый чат, либо открываем первый из списка.
  // Если сохранённый чат больше не существует, переключаемся на первую доступную беседу.
  useEffect(() => {
    if (!conversations.length) return;
    if (activeConversationId) {
      const exists = conversations.some((c) => c.id === activeConversationId);
      if (exists) return;
    }
    const savedId = readLastActiveConversationId();
    const savedExists = savedId
      ? conversations.some((c) => c.id === savedId)
      : false;
    setActiveConversationId(savedExists ? savedId : conversations[0].id);
  }, [activeConversationId, conversations]);

  const counters = useChatCounters(isEnabled);
  const { conversation: activeDetails } = useChatConversation(
    isEnabled ? activeConversationId : null,
  );

  const {
    messages: rawMessages,
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    hasOlder,
    isLoadingOlder,
    loadOlder,
  } = useChatMessages(isEnabled ? activeConversationId : null);

  const { threadMessages: rawThread, isLoading: isLoadingThread } =
    useChatThread(threadMessageId);

  // Состав беседы приводим к плоскому виду один раз: дальше и аватары, и
  // «печатает…», и панель участников работают с полями пользователя напрямую.
  const activeMembers = useMemo(
    () => normalizeMembers(activeDetails?.members),
    [activeDetails],
  );

  // Аватары и превью — приватные файлы, их надо забрать с токеном до отрисовки.
  const mediaSources = useMemo(() => {
    const sources: (string | null)[] = [];
    conversations.forEach((conversation) =>
      sources.push(getConversationAvatarSource(conversation, currentUserId)),
    );
    if (activeDetails) {
      sources.push(getConversationAvatarSource(activeDetails, currentUserId));
      activeMembers.forEach((member) => sources.push(getUserAvatarSource(member)));
    }
    [...rawMessages, ...rawThread].forEach((message) => {
      sources.push(getUserAvatarSource(message.sender));
      (message.attachments ?? []).forEach((attachment) =>
        sources.push(getAttachmentPreviewSource(attachment)),
      );
    });
    return sources;
  }, [conversations, activeDetails, activeMembers, rawMessages, rawThread, currentUserId]);

  const media = useAuthorizedMedia(mediaSources);

  const mapContext = useMemo<IMapContext>(
    () => ({ currentUserId, media, labels }),
    [currentUserId, media, labels],
  );

  const contacts = useMemo<Contact[]>(
    () =>
      conversations.map((conversation) =>
        mapConversation(conversation, mapContext),
      ),
    [conversations, mapContext],
  );

  const activeContact = useMemo<Contact | null>(() => {
    if (activeDetails) return mapConversation(activeDetails, mapContext);
    return contacts.find((c) => c.id === String(activeConversationId)) ?? null;
  }, [activeDetails, contacts, activeConversationId, mapContext]);

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  useEffect(() => {
    setOptimisticMessages((prev) => {
      prev.forEach(revokeOptimisticPreviews);
      return prev.length ? [] : prev;
    });
  }, [activeConversationId]);

  // Оптимистичное сообщение помечаем верхней границей уже известной ленты:
  // сопоставление с сервером (`isOptimisticMatch`) должно смотреть только на то,
  // что придёт после отправки.
  const addOptimisticMessage = useCallback(
    (msg: Message) => {
      const knownMaxId = rawMessages.reduce(
        (max, message) => Math.max(max, Number(message.id) || 0),
        0,
      );
      setOptimisticMessages((prev) => [
        ...prev,
        { ...msg, optimisticAfterId: knownMaxId },
      ]);
    },
    [rawMessages],
  );

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages((prev) => {
      const target = prev.find((m) => m.id === tempId);
      if (target) revokeOptimisticPreviews(target);
      return prev.filter((m) => m.id !== tempId);
    });
  }, []);

  const currentUserAvatar = useMemo(
    () =>
      resolveMedia(
        getUserAvatarSource(user as Parameters<typeof getUserAvatarSource>[0]),
        mapContext,
        user?.full_name ?? labels.you,
      ),
    [user, mapContext, labels.you],
  );

  // Оптимистичное сообщение живёт до своего появления в серверной ленте: как
  // только бэкенд его вернул, показываем серверную версию — с реальным статусом
  // вместо часов «отправляется».
  useEffect(() => {
    if (!optimisticMessages.length || !rawMessages.length) return;
    const serverMsgs = rawMessages
      .filter(
        (message) =>
          !message.is_deleted_for_everyone && !message.is_deleted_for_me,
      )
      .map((message) => mapMessage(message, mapContext));
    const settled = optimisticMessages.filter((opt) =>
      serverMsgs.some((s) => isOptimisticMatch(opt, s)),
    );
    if (!settled.length) return;
    settled.forEach(revokeOptimisticPreviews);
    setOptimisticMessages((prev) =>
      prev.filter((opt) => !settled.includes(opt)),
    );
  }, [rawMessages, mapContext, optimisticMessages]);

  const messages = useMemo<Message[]>(() => {
    const serverMsgs = rawMessages
      .filter(
        (message) =>
          !message.is_deleted_for_everyone && !message.is_deleted_for_me,
      )
      .map((message) => mapMessage(message, mapContext));
    if (!optimisticMessages.length) return serverMsgs;

    const pendingOptimistic = optimisticMessages.filter(
      (opt) => !serverMsgs.some((s) => isOptimisticMatch(opt, s)),
    );

    return [...serverMsgs, ...pendingOptimistic];
  }, [rawMessages, mapContext, optimisticMessages]);

  const threadMessages = useMemo<Message[]>(
    () =>
      rawThread
        .filter(
          (message) =>
            !message.is_deleted_for_everyone && !message.is_deleted_for_me,
        )
        .map((message) => mapMessage(message, mapContext)),
    [rawThread, mapContext],
  );

  const messageActions = useMessageActions(activeConversationId);
  const conversationActions = useConversationActions(activeConversationId);
  const { notifyTyping, stopTyping, markRead, markDelivered } =
    useChatSignals(activeConversationId);

  const handleIncomingMessage = useCallback(
    (event: IChatMessageEvent) => {
      const messageId = event.message?.id ?? event.message_id;
      if (messageId) markDelivered(messageId);
      // Беседа открыта на экране — сообщение сразу считается прочитанным.
      markRead();
    },
    [markDelivered, markRead],
  );

  const { typingUserIds } = useChatRealtime({
    currentUserId,
    organizationId,
    conversationId: isEnabled ? activeConversationId : null,
    onIncomingMessage: handleIncomingMessage,
  });

  // Открытие беседы снимает непрочитанное — и на бэкенде, и в счётчиках.
  useEffect(() => {
    if (!isEnabled || !activeConversationId) return;
    markRead();
  }, [isEnabled, activeConversationId, markRead]);

  const typingNames = useMemo(() => {
    if (!typingUserIds.length) return [];
    return typingUserIds.map(
      (id) => activeMembers.find((member) => member.id === id)?.full_name ?? "",
    );
  }, [typingUserIds, activeMembers]);

  const selectConversation = useCallback(
    (contactId: string) => {
      const id = toId(contactId);
      if (!id || id === activeConversationId) return;
      stopTyping();
      setActiveConversationId(id);
    },
    [activeConversationId, stopTyping],
  );

  return {
    currentUserId,
    contacts,
    activeContact,
    activeConversationId,
    activeMembers,
    selectConversation,
    setActiveConversationId,
    messages,
    addOptimisticMessage,
    removeOptimisticMessage,
    currentUserAvatar,
    labels,
    threadMessages,
    counters,
    isLoadingChats,
    isChatsError,
    isLoadingMessages,
    isMessagesError,
    isLoadingThread,
    hasOlder,
    isLoadingOlder,
    loadOlder,
    typingNames,
    notifyTyping,
    stopTyping,
    markRead,
    ...messageActions,
    ...conversationActions,
  };
};
