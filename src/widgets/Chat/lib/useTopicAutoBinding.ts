import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TOPIC_ID, type IBindMessagesPayload, type TTopicId } from "../api/topics";
import type { Message } from "../model";
import {
  inferServerTopicLinks,
  isOptimisticMessage,
  type IPendingTopicMessage,
} from "./chatTopics";

// Привязка отправленных сообщений к топику. Отправка общая для всего чата и про
// топики не знает: сообщение появляется оптимистично (temp-id), а серверный id
// приходит позже. Поэтому запоминаем, из какого топика ушло оптимистичное
// сообщение, и, когда сервер вернул его версию, сохраняем привязку уже по
// настоящему id. С API это заменит поле topic_id в теле отправки.

interface IOptions {
  /** null — топики в беседе выключены. */
  conversationId: number | null;
  /** Полная лента беседы, без фильтра по топику. */
  messages: Message[];
  activeTopicId: TTopicId;
  getStoredTopicId: (message: Message) => TTopicId | null;
  bindMessages: (payload: IBindMessagesPayload) => void;
}

export const useTopicAutoBinding = ({
  conversationId,
  messages,
  activeTopicId,
  getStoredTopicId,
  bindMessages,
}: IOptions) => {
  const [pending, setPending] = useState<Record<string, IPendingTopicMessage>>({});

  useEffect(() => {
    if (conversationId === null) return;
    const fresh = messages.filter((message) => isOptimisticMessage(message) && !pending[message.id]);
    if (!fresh.length) return;
    setPending((prev) => {
      const next = { ...prev };
      fresh.forEach((message) => {
        next[message.id] = { message, topicId: activeTopicId, conversationId };
      });
      return next;
    });
  }, [messages, conversationId, activeTopicId, pending]);

  // Записи других бесед не трогаем: их ответ сервера увидим, когда вернёмся туда.
  const currentPending = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pending).filter(([, entry]) => entry.conversationId === conversationId),
      ),
    [pending, conversationId],
  );

  const inferredLinks = useMemo(
    () => inferServerTopicLinks(currentPending, messages),
    [currentPending, messages],
  );

  useEffect(() => {
    if (conversationId === null) return;
    const isSaved = (link: (typeof inferredLinks)[number]) =>
      link.topicId === DEFAULT_TOPIC_ID || getStoredTopicId(link.serverMessage) === link.topicId;

    const toBind = inferredLinks.filter((link) => !isSaved(link));
    if (toBind.length) {
      bindMessages({
        conversationId,
        links: toBind.map((link) => ({ messageId: link.serverMessage.id, topicId: link.topicId })),
      });
    }

    const settled = new Set(inferredLinks.filter(isSaved).map((link) => link.tempId));
    // Оптимистичное сообщение пропало без серверной пары — отправка не удалась.
    Object.keys(currentPending).forEach((tempId) => {
      const isMatched = inferredLinks.some((link) => link.tempId === tempId);
      if (!isMatched && !messages.some((message) => message.id === tempId)) settled.add(tempId);
    });
    if (!settled.size) return;
    setPending((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([tempId]) => !settled.has(tempId))),
    );
  }, [conversationId, inferredLinks, currentPending, messages, getStoredTopicId, bindMessages]);

  const inferredTopicById = useMemo(
    () =>
      Object.fromEntries(inferredLinks.map((link) => [link.serverMessage.id, link.topicId])),
    [inferredLinks],
  );

  return { pending: currentPending, inferredTopicById };
};
