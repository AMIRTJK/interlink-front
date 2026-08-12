import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  acquireEcho,
  getUserChannelName,
  releaseEcho,
  tokenControl,
  type TEchoClient,
} from "@shared/lib";
import { REVERB_CONFIG } from "@shared/config";
import type {
  IChatMessageDeletedEvent,
  IChatMessageEvent,
  IChatPresenceEvent,
  IChatTypingEvent,
} from "../model";
import { markMessageDeletedInCache } from "./chatMessageCache";
import { chatUrls } from "./chatUrls";

// ─── Realtime-слой чата ──────────────────────────────────────────────────────
// События Reverb дают мгновенный UI, но источником истины остаётся REST: почти
// каждый обработчик просто инвалидирует нужный запрос. Исключение — «печатает»:
// у него нет своей ручки, состояние живёт только в памяти вкладки.
// Ведущая точка в имени события означает broadcastAs без namespace.

const EVENTS = {
  conversationCreated: ".chat.conversation.created",
  conversationUpdated: ".chat.conversation.updated",
  membersUpdated: ".chat.members.updated",
  messageCreated: ".chat.message.created",
  messageDeleted: ".chat.message.deleted",
  messagePinned: ".chat.message.pinned",
  reactionUpdated: ".chat.reaction.updated",
  readUpdated: ".chat.read.updated",
  deliveredUpdated: ".chat.delivered.updated",
  typingUpdated: ".chat.typing.updated",
  presenceUpdated: ".chat.presence.updated",
} as const;

/** Страховка от «залипшего» индикатора, если is_typing:false не дошёл. */
const TYPING_TTL_MS = 6000;

interface IRealtimeOptions {
  currentUserId: number | null;
  organizationId: number | null;
  conversationId: number | null;
  /** Чужое сообщение в открытой беседе: отмечаем доставку и прочтение. */
  onIncomingMessage: (event: IChatMessageEvent) => void;
}

/** Пара «имя события Reverb → обработчик»: их вешаем и снимаем одинаково. */
type TEventBinding = [event: string, handler: (payload: never) => void];

type TPusherConnection = {
  bind: (event: string, handler: () => void) => void;
  unbind: (event: string, handler: () => void) => void;
};

const getConnection = (echo: TEchoClient): TPusherConnection | null => {
  const connector = (
    echo as unknown as {
      connector?: { pusher?: { connection?: TPusherConnection } };
    }
  ).connector;
  return connector?.pusher?.connection ?? null;
};

export const useChatRealtime = ({
  currentUserId,
  organizationId,
  conversationId,
  onIncomingMessage,
}: IRealtimeOptions) => {
  const queryClient = useQueryClient();
  // Индикатор набора помечен беседой: при переключении чата чужой «печатает…»
  // отпадает сам, без сброса состояния эффектом.
  const [typing, setTyping] = useState<{
    conversationId: number | null;
    userIds: number[];
  }>({ conversationId: null, userIds: [] });
  const typingTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const token = tokenControl.get();

  const invalidate = useCallback(
    (keys: string[]) => {
      keys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );
    },
    [queryClient],
  );

  const dropTyping = useCallback((userId: number) => {
    const timer = typingTimersRef.current.get(userId);
    if (timer) clearTimeout(timer);
    typingTimersRef.current.delete(userId);
    setTyping((prev) => ({
      ...prev,
      userIds: prev.userIds.filter((id) => id !== userId),
    }));
  }, []);

  const handleTyping = useCallback(
    (event: IChatTypingEvent) => {
      if (event.user_id === currentUserId) return;
      if (!event.is_typing) {
        dropTyping(event.user_id);
        return;
      }

      const timers = typingTimersRef.current;
      const existing = timers.get(event.user_id);
      if (existing) clearTimeout(existing);
      timers.set(
        event.user_id,
        setTimeout(() => dropTyping(event.user_id), TYPING_TTL_MS),
      );

      setTyping((prev) =>
        prev.conversationId === event.conversation_id
          ? {
              conversationId: prev.conversationId,
              userIds: prev.userIds.includes(event.user_id)
                ? prev.userIds
                : [...prev.userIds, event.user_id],
            }
          : { conversationId: event.conversation_id, userIds: [event.user_id] },
      );
    },
    [currentUserId, dropTyping],
  );

  // Таймеры «печатает…» не должны пережить размонтирование чата.
  useEffect(() => {
    const timers = typingTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!REVERB_CONFIG.isEnabled || !currentUserId || !token) return;

    const channels: string[] = [getUserChannelName(currentUserId)];
    if (conversationId) channels.push(`chat.conversation.${conversationId}`);
    if (organizationId) channels.push(`organization.${organizationId}`);

    const listKeys = [chatUrls.conversations, chatUrls.counters];
    const messageKeys = conversationId
      ? [...listKeys, chatUrls.messages(conversationId)]
      : listKeys;

    // Канал `user.{id}` общий с уведомлениями, поэтому при размонтировании чата
    // с него снимаются только свои обработчики: `leave` отписал бы и соседа.
    const userChannel = getUserChannelName(currentUserId);

    const handlers: TEventBinding[] = [
      [
        EVENTS.messageCreated,
        (event: IChatMessageEvent) => {
          invalidate(messageKeys);
          if (event?.conversation_id === conversationId) onIncomingMessage(event);
        },
      ],
      [
        // Событие приходит и в канал беседы, и в приватный канал автора запроса,
        // поэтому обработчик идемпотентен: повторное применение ничего не меняет.
        EVENTS.messageDeleted,
        (event: IChatMessageDeletedEvent) => {
          markMessageDeletedInCache(queryClient, {
            conversationId: event?.conversation_id,
            messageId: event?.message_id,
            scope: event?.scope ?? "everyone",
          });
          invalidate(messageKeys);
        },
      ],
      [EVENTS.messagePinned, () => invalidate(messageKeys)],
      [EVENTS.reactionUpdated, () => invalidate(messageKeys)],
      [EVENTS.readUpdated, () => invalidate(messageKeys)],
      [EVENTS.deliveredUpdated, () => invalidate(messageKeys)],
      [EVENTS.membersUpdated, () => invalidate(messageKeys)],
      [EVENTS.conversationCreated, () => invalidate(listKeys)],
      [EVENTS.conversationUpdated, () => invalidate(listKeys)],
      [EVENTS.typingUpdated, handleTyping],
      [
        EVENTS.presenceUpdated,
        (event: IChatPresenceEvent) => {
          if (event?.user_id === currentUserId) return;
          invalidate([chatUrls.conversations, chatUrls.users]);
        },
      ],
    ];

    let echo: TEchoClient | null = null;
    let connection: TPusherConnection | null = null;
    let isCancelled = false;

    // После разрыва связи события за время простоя потеряны: перечитываем всё,
    // что видно на экране, — так требует контракт бэкенда.
    const handleReconnect = () => invalidate(messageKeys);

    acquireEcho(token)
      .then((instance) => {
        if (!instance || isCancelled) return;
        echo = instance;

        channels.forEach((channelName) => {
          const channel = instance.private(channelName);
          handlers.forEach(([event, handler]) => channel.listen(event, handler));
          channel.error((error: unknown) => {
            console.error("Чат: ошибка подписки на канал", channelName, error);
          });
        });

        connection = getConnection(instance);
        connection?.bind("connected", handleReconnect);
      })
      .catch((error: unknown) => {
        console.error("Чат: не удалось подключиться к Reverb", error);
      });

    return () => {
      isCancelled = true;
      connection?.unbind("connected", handleReconnect);

      const instance = echo;
      if (instance) {
        channels.forEach((channelName) => {
          if (channelName === userChannel) {
            const channel = instance.private(channelName);
            handlers.forEach(([event, handler]) =>
              channel.stopListening(event, handler),
            );
            return;
          }
          instance.leave(channelName);
        });
      }

      echo = null;
      releaseEcho();
    };
  }, [
    token,
    currentUserId,
    organizationId,
    conversationId,
    queryClient,
    invalidate,
    handleTyping,
    onIncomingMessage,
  ]);

  return {
    typingUserIds:
      typing.conversationId === conversationId ? typing.userIds : [],
  };
};
