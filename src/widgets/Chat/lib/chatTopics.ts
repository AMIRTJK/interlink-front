import { DEFAULT_TOPIC_ID, type TTopicId } from "../api/topics";
import type { Message } from "../model";
import { isOptimisticMatch } from "./chatMappers";

// Чистые функции раскладки ленты по топикам: к какому топику относится
// сообщение и какие серверные сообщения пришли на место отправленных из топика.

/** Сообщение, которое ещё не вернулось с сервера (id выдаёт useChatComposer). */
export const isOptimisticMessage = (message: Message) => message.id.startsWith("temp-");

/** Отправленное из топика сообщение, ждущее серверного id. */
export interface IPendingTopicMessage {
  message: Message;
  topicId: TTopicId;
  conversationId: number;
}

export interface IInferredTopicLink {
  tempId: string;
  serverMessage: Message;
  topicId: TTopicId;
}

/**
 * Серверные сообщения, пришедшие на место оптимистичных. Нужны, чтобы
 * сообщение не «выпрыгивало» в «Общий» на те кадры, пока привязка ещё не
 * сохранена.
 */
export const inferServerTopicLinks = (
  pending: Record<string, IPendingTopicMessage>,
  messages: Message[],
): IInferredTopicLink[] => {
  const result: IInferredTopicLink[] = [];
  Object.entries(pending).forEach(([tempId, entry]) => {
    const serverMessage = messages.find(
      (message) =>
        !isOptimisticMessage(message) &&
        !result.some((link) => link.serverMessage.id === message.id) &&
        isOptimisticMatch(entry.message, message),
    );
    if (serverMessage) result.push({ tempId, serverMessage, topicId: entry.topicId });
  });
  return result;
};

interface IResolveContext {
  getStoredTopicId: (message: Message) => TTopicId | null;
  inferred: Record<string, TTopicId>;
  pending: Record<string, IPendingTopicMessage>;
  activeTopicId: TTopicId;
}

export const resolveMessageTopicId = (
  message: Message,
  { getStoredTopicId, inferred, pending, activeTopicId }: IResolveContext,
): TTopicId => {
  const stored = getStoredTopicId(message);
  if (stored) return stored;
  if (inferred[message.id]) return inferred[message.id];
  // Только что отправленное ещё не успело попасть в реестр — оно из текущего топика.
  if (isOptimisticMessage(message)) return pending[message.id]?.topicId ?? activeTopicId;
  return DEFAULT_TOPIC_ID;
};
