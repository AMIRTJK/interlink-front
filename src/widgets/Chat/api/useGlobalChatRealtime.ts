import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  acquireEcho,
  getUserChannelName,
  releaseEcho,
  tokenControl,
  type TEchoClient,
} from "@shared/lib";
import { REVERB_CONFIG } from "@shared/config";
import { chatUrls } from "./chatUrls";

const EVENTS = [
  ".chat.message.created",
  ".chat.message.deleted",
  ".chat.conversation.created",
  ".chat.conversation.updated",
  ".chat.read.updated",
  ".chat.delivered.updated",
] as const;

/**
 * Глобальный фоновый WebSocket-слушатель чата:
 * Работает всегда, пока пользователь авторизован в системе (даже при закрытом окне чата).
 * При получении событий о новых сообщениях или изменениях бесед мгновенно
 * инвалидирует кэш счётчиков (chatUrls.counters) и списка бесед (chatUrls.conversations),
 * благодаря чему плавающая кнопка и счётчики обновляются в реальном времени.
 */
export const useGlobalChatRealtime = (currentUserId: number | null) => {
  const queryClient = useQueryClient();
  const token = tokenControl.get();

  useEffect(() => {
    if (!REVERB_CONFIG.isEnabled || !currentUserId || !token) return;

    const userChannel = getUserChannelName(currentUserId);
    let echo: TEchoClient | null = null;
    let isCancelled = false;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: [chatUrls.counters] });
      queryClient.invalidateQueries({ queryKey: [chatUrls.conversations] });
    };

    acquireEcho(token)
      .then((instance) => {
        if (!instance || isCancelled) return;
        echo = instance;

        const channel = instance.private(userChannel);
        EVENTS.forEach((event) => {
          channel.listen(event, handleUpdate);
        });
      })
      .catch((error: unknown) => {
        console.error("Глобальный чат: не удалось подключиться к Reverb", error);
      });

    return () => {
      isCancelled = true;
      if (echo) {
        const channel = echo.private(userChannel);
        EVENTS.forEach((event) => {
          channel.stopListening(event, handleUpdate);
        });
      }
      echo = null;
      releaseEcho();
    };
  }, [token, currentUserId, queryClient]);
};
