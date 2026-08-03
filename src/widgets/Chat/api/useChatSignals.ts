import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { _axios } from "@shared/api";
import { chatUrls } from "./chatUrls";

// ─── Служебные сигналы чата ──────────────────────────────────────────────────
// «Прочитано», «доставлено», «печатает» и heartbeat присутствия — не мутации
// данных, а поток фоновых уведомлений: они уходят десятками за сессию, ничего
// не возвращают и не должны показывать тосты. Поэтому здесь прямой `_axios`
// вместо `useMutationQuery` (ошибка такого сигнала для пользователя не событие).

/** Пауза в наборе, после которой считаем, что пользователь перестал печатать. */
const TYPING_IDLE_MS = 2500;

/** Online-TTL на бэкенде — 90 с, обновляемся вдвое чаще. */
const HEARTBEAT_INTERVAL_MS = 45 * 1000;

const post = (url: string, body?: Record<string, unknown>) =>
  _axios.post(url, body ?? {}).catch(() => undefined);

export const useChatSignals = (conversationId: number | null) => {
  const queryClient = useQueryClient();
  const isTypingSentRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTypingState = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      isTypingSentRef.current = isTyping;
      void post(chatUrls.typing(conversationId), { is_typing: isTyping });
    },
    [conversationId],
  );

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (isTypingSentRef.current) sendTypingState(false);
  }, [sendTypingState]);

  /** Вызывается на ввод: первый символ включает индикатор, пауза — выключает. */
  const notifyTyping = useCallback(() => {
    if (!conversationId) return;
    if (!isTypingSentRef.current) sendTypingState(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
      sendTypingState(false);
    }, TYPING_IDLE_MS);
  }, [conversationId, sendTypingState]);

  const markRead = useCallback(() => {
    if (!conversationId) return;
    void post(chatUrls.read(conversationId)).then(() => {
      queryClient.invalidateQueries({ queryKey: [chatUrls.conversations] });
      queryClient.invalidateQueries({ queryKey: [chatUrls.counters] });
    });
  }, [conversationId, queryClient]);

  const markDelivered = useCallback(
    (messageId: number) => {
      if (!conversationId) return;
      void post(chatUrls.delivered(conversationId), { message_id: messageId });
    },
    [conversationId],
  );

  // Смена беседы или размонтирование не должны оставлять «печатает…» висеть.
  useEffect(() => stopTyping, [stopTyping]);

  return { notifyTyping, stopTyping, markRead, markDelivered };
};

/**
 * Отметка присутствия: бэкенд держит статус online 90 секунд с последнего
 * heartbeat, поэтому пока чат открыт, стучимся каждые 45 секунд.
 */
export const usePresenceHeartbeat = (isEnabled: boolean) => {
  useEffect(() => {
    if (!isEnabled) return;

    void post(chatUrls.presenceHeartbeat);
    const interval = setInterval(
      () => void post(chatUrls.presenceHeartbeat),
      HEARTBEAT_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [isEnabled]);
};
