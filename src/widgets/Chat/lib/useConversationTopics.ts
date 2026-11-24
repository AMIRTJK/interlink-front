import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { DEFAULT_TOPIC_ID, useChatTopics, type TTopicId } from "../api/topics";
import type { Message } from "../model";
import { resolveMessageTopicId } from "./chatTopics";
import { useTopicAutoBinding } from "./useTopicAutoBinding";

// Топики личного чата для экрана: выбранный топик каждой беседы, лента,
// отфильтрованная по нему, и действия над топиками. Источник данных — хук
// useChatTopics; откуда он их берёт (сейчас — локальное хранилище), здесь
// неизвестно.

interface IOptions {
  conversationId: number | null;
  /** Топики есть только в беседах один на один. */
  isDirect: boolean;
  /** Полная лента беседы. */
  messages: Message[];
  scrollRef: RefObject<HTMLDivElement | null>;
}

export const useConversationTopics = ({
  conversationId,
  isDirect,
  messages,
  scrollRef,
}: IOptions) => {
  const topicsConversationId = isDirect ? conversationId : null;
  const {
    topics,
    isLoading,
    getMessageTopicId,
    createTopic,
    renameTopic,
    deleteTopic,
    bindMessages,
    isMutating,
  } = useChatTopics(topicsConversationId);

  // Выбор топика помним для каждой беседы отдельно, пока открыт чат.
  const [activeByConversation, setActiveByConversation] = useState<Record<number, TTopicId>>({});
  const requestedTopicId =
    topicsConversationId !== null ? activeByConversation[topicsConversationId] : undefined;
  // Удалённый (в том числе в соседней вкладке) топик сам сменяется на «Общий».
  const activeTopicId =
    requestedTopicId && topics.some((topic) => topic.id === requestedTopicId)
      ? requestedTopicId
      : DEFAULT_TOPIC_ID;
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;

  const selectTopic = useCallback(
    (topicId: TTopicId) => {
      if (topicsConversationId === null) return;
      setActiveByConversation((prev) => ({ ...prev, [topicsConversationId]: topicId }));
    },
    [topicsConversationId],
  );

  const { pending, inferredTopicById } = useTopicAutoBinding({
    conversationId: topicsConversationId,
    messages,
    activeTopicId,
    getStoredTopicId: getMessageTopicId,
    bindMessages,
  });

  const topicMessages = useMemo(() => {
    if (topicsConversationId === null) return messages;
    const context = {
      getStoredTopicId: getMessageTopicId,
      inferred: inferredTopicById,
      pending,
      activeTopicId,
    };
    return messages.filter(
      (message) => resolveMessageTopicId(message, context) === activeTopicId,
    );
  }, [topicsConversationId, messages, getMessageTopicId, inferredTopicById, pending, activeTopicId]);

  // Смена топика — это как открыть другую беседу: начинаем с последних сообщений.
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [activeTopicId, topicsConversationId, scrollRef]);

  const handleCreateTopic = useCallback(
    (title: string) => {
      if (topicsConversationId === null) return;
      createTopic(
        { conversationId: topicsConversationId, title },
        { onSuccess: (topic) => selectTopic(topic.id) },
      );
    },
    [topicsConversationId, createTopic, selectTopic],
  );

  const handleRenameTopic = useCallback(
    (topicId: TTopicId, title: string) => {
      if (topicsConversationId === null) return;
      renameTopic({ conversationId: topicsConversationId, topicId, title });
    },
    [topicsConversationId, renameTopic],
  );

  const handleDeleteTopic = useCallback(
    (topicId: TTopicId) => {
      if (topicsConversationId === null) return;
      deleteTopic({ conversationId: topicsConversationId, topicId });
    },
    [topicsConversationId, deleteTopic],
  );

  return {
    isEnabled: topicsConversationId !== null,
    isLoading,
    isMutating,
    topics,
    activeTopicId,
    activeTopic,
    topicMessages,
    selectTopic,
    createTopic: handleCreateTopic,
    renameTopic: handleRenameTopic,
    deleteTopic: handleDeleteTopic,
  };
};

export type TConversationTopicsState = ReturnType<typeof useConversationTopics>;
