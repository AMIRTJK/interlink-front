import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@shared/lib";
import type { Message } from "../../model";
import { isTopicsStorageKey, topicsLocalAdapter } from "./topicsLocalAdapter";
import {
  DEFAULT_TOPIC_ID,
  TOPICS_QUERY_KEY,
  type IBindMessagesPayload,
  type ICreateTopicPayload,
  type IDeleteTopicPayload,
  type IRenameTopicPayload,
  type ITopic,
  type TTopicId,
} from "./model";

// Слой данных топиков. Наружу — тот же набор, что дали бы useGetQuery и
// useMutationQuery (данные, isLoading/isError, mutate), поэтому UI не знает,
// откуда пришли топики. Сейчас queryFn/mutationFn — локальный адаптер
// (см. комментарий в topicsLocalAdapter.ts); с API меняется только этот файл.

const EMPTY_TOPICS: ITopic[] = [];
const EMPTY_LINKS: Record<string, TTopicId> = {};

const topicsKey = (conversationId: number | null) => [TOPICS_QUERY_KEY, conversationId];

const showError = (error: unknown) =>
  toast.error(error instanceof Error ? error.message : "Не удалось сохранить топик");

export const useChatTopics = (conversationId: number | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: topicsKey(conversationId),
    queryFn: () =>
      conversationId === null
        ? Promise.resolve({ topics: EMPTY_TOPICS, message_topics: EMPTY_LINKS })
        : topicsLocalAdapter.list(conversationId),
    enabled: conversationId !== null,
    staleTime: Infinity,
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [TOPICS_QUERY_KEY] }),
    [queryClient],
  );

  // Топики, созданные в соседней вкладке, подтягиваем сразу — с сервером эту
  // роль возьмут realtime-события беседы.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (isTopicsStorageKey(event.key)) void invalidate();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [invalidate]);

  const create = useMutation({
    mutationFn: (payload: ICreateTopicPayload) => topicsLocalAdapter.create(payload),
    onSuccess: invalidate,
    onError: showError,
  });

  const rename = useMutation({
    mutationFn: (payload: IRenameTopicPayload) => topicsLocalAdapter.rename(payload),
    onSuccess: invalidate,
    onError: showError,
  });

  const remove = useMutation({
    mutationFn: (payload: IDeleteTopicPayload) => topicsLocalAdapter.remove(payload),
    onSuccess: invalidate,
    onError: showError,
  });

  const bind = useMutation({
    mutationFn: (payload: IBindMessagesPayload) => topicsLocalAdapter.bindMessages(payload),
    onSuccess: invalidate,
    onError: showError,
  });

  const messageTopics = query.data?.message_topics ?? EMPTY_LINKS;

  /** Топик сообщения по данным сервера; `null` — привязки нет («Общий»). */
  const getMessageTopicId = useCallback(
    (message: Message): TTopicId | null => {
      const topicId = messageTopics[message.id];
      return topicId && topicId !== DEFAULT_TOPIC_ID ? topicId : null;
    },
    [messageTopics],
  );

  return {
    topics: query.data?.topics ?? EMPTY_TOPICS,
    isLoading: query.isLoading && conversationId !== null,
    isError: query.isError,
    getMessageTopicId,
    createTopic: create.mutate,
    renameTopic: rename.mutate,
    deleteTopic: remove.mutate,
    bindMessages: bind.mutate,
    isMutating: create.isLoading || rename.isLoading || remove.isLoading,
  };
};
