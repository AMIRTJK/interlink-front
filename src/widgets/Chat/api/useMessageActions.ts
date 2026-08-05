import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { buildFormData, useMutationQuery } from "@shared/lib";
import type { IChatMessage } from "../model";
import { chatUrls } from "./chatUrls";

// Действия над сообщениями. Тосты по умолчанию гасим: в чате подтверждением
// служит само сообщение в ленте, а всплывающее «Операция выполнена» на каждый
// клик по реакции — шум. Ошибки при этом показываются как обычно.

export interface ISendMessagePayload {
  conversationId: number;
  /** Фронт генерирует его сам и повторяет при retry — защита от дублей. */
  clientUuid: string;
  body?: string;
  kind?: "text" | "attachment" | "voice";
  replyToId?: number;
  threadParentId?: number;
  /** ISO-время отложенной отправки. */
  scheduledAt?: string;
  files?: File[];
  /** Длительности вложений в мс — нужны голосовым сообщениям. */
  durations?: number[];
}

export interface IDeleteMessagePayload {
  messageId: number;
  scope: "me" | "everyone";
}

export interface IForwardPayload {
  messageId: number;
  conversationIds: number[];
  comment?: string;
}

interface IReactionPayload {
  messageId: number;
  emoji: string;
}

interface IPinPayload {
  messageId: number;
  isPinned: boolean;
}

/** Ключи кэша, которые задевает любое изменение сообщений беседы. */
const messageScopeKeys = (conversationId: number) => [
  chatUrls.messages(conversationId),
  chatUrls.conversations,
  chatUrls.counters,
];

export const useMessageActions = (conversationId: number | null) => {
  const queryClient = useQueryClient();
  const invalidate = conversationId ? messageScopeKeys(conversationId) : [];

  const sendMutation = useMutationQuery<ISendMessagePayload, IChatMessage>({
    url: (payload) => chatUrls.messages(payload.conversationId),
    method: "POST",
    // Вложения уходят только multipart, поэтому и текст шлём формой: один
    // формат запроса вместо двух веток на клиенте и на бэкенде.
    transformBody: (payload) =>
      buildFormData({
        client_uuid: payload.clientUuid,
        body: payload.body,
        kind: payload.kind ?? "text",
        reply_to_id: payload.replyToId,
        thread_parent_id: payload.threadParentId,
        scheduled_at: payload.scheduledAt,
        attachments: payload.files,
        attachment_durations: payload.durations,
      }),
    messages: {
      suppressSuccessToast: true,
      invalidate,
      // Ответ в треде не попадает в ленту беседы, поэтому лента его инвалидацией
      // не обновляет — перечитываем сам тред по родительскому сообщению.
      onSuccessCb: (created: IChatMessage) => {
        const parentId = created?.thread_parent_id;
        if (!parentId) return;
        queryClient.invalidateQueries({
          queryKey: [chatUrls.thread(parentId)],
        });
      },
    },
  });

  const deleteMutation = useMutationQuery<IDeleteMessagePayload>({
    url: (payload) => chatUrls.message(payload.messageId),
    method: "DELETE",
    transformBody: (payload) => ({ scope: payload.scope }),
    messages: { suppressSuccessToast: true, invalidate },
  });

  const addReactionMutation = useMutationQuery<IReactionPayload>({
    url: (payload) => chatUrls.reactions(payload.messageId),
    method: "PUT",
    transformBody: (payload) => ({ emoji: payload.emoji }),
    messages: { suppressSuccessToast: true, invalidate },
  });

  const removeReactionMutation = useMutationQuery<IReactionPayload>({
    url: (payload) => chatUrls.reaction(payload.messageId, payload.emoji),
    method: "DELETE",
    messages: { suppressSuccessToast: true, invalidate },
  });

  const pinMutation = useMutationQuery<IPinPayload>({
    url: (payload) => chatUrls.pin(payload.messageId),
    method: "POST",
    messages: { suppressSuccessToast: true, invalidate },
  });

  const unpinMutation = useMutationQuery<IPinPayload>({
    url: (payload) => chatUrls.pin(payload.messageId),
    method: "DELETE",
    messages: { suppressSuccessToast: true, invalidate },
  });

  const forwardMutation = useMutationQuery<IForwardPayload>({
    url: (payload) => chatUrls.forward(payload.messageId),
    method: "POST",
    transformBody: (payload) => ({
      conversation_ids: payload.conversationIds,
      comment: payload.comment,
    }),
    messages: {
      success: "Сообщение переслано",
      invalidate: [chatUrls.conversations, chatUrls.counters],
    },
  });

  const toggleReaction = useCallback(
    (messageId: number, emoji: string, isReactedByMe: boolean) => {
      const payload = { messageId, emoji };
      if (isReactedByMe) removeReactionMutation.mutate(payload);
      else addReactionMutation.mutate(payload);
    },
    [addReactionMutation, removeReactionMutation],
  );

  const togglePin = useCallback(
    (messageId: number, isPinned: boolean) => {
      const payload = { messageId, isPinned };
      if (isPinned) unpinMutation.mutate(payload);
      else pinMutation.mutate(payload);
    },
    [pinMutation, unpinMutation],
  );

  return {
    sendMessage: sendMutation.mutate,
    sendMessageAsync: sendMutation.mutateAsync,
    isSending: sendMutation.isLoading,
    deleteMessage: deleteMutation.mutate,
    toggleReaction,
    togglePin,
    forwardMessage: forwardMutation.mutate,
  };
};
