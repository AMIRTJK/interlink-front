import { useCallback } from "react";
import type { useChatData } from "./useChatData";
import type { useChatUiState } from "./useChatUiState";

// Отправка сообщений: текст, вложения, голосовое, отложенная отправка и ответы
// в треде. Всё уходит одной ручкой POST /conversations/{id}/messages.

type TChatUi = ReturnType<typeof useChatUiState>;
type TChatData = ReturnType<typeof useChatData>;

/** Один и тот же uuid при повторе отправки защищает от дубля на бэкенде. */
const createClientUuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const toChatId = (value: string | null | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const useChatComposer = (ui: TChatUi, data: TChatData) => {
  const {
    activeConversationId,
    sendMessage,
    notifyTyping,
    stopTyping,
  } = data;

  const send = useCallback(
    (payload: Omit<Parameters<typeof sendMessage>[0], "clientUuid">) => {
      stopTyping();
      sendMessage({ ...payload, clientUuid: createClientUuid() });
    },
    [sendMessage, stopTyping],
  );

  const handleSend = useCallback(() => {
    if (!activeConversationId) return;
    const body = ui.input.trim();
    const files = ui.pendingFiles.map((file) => file.raw);
    if (!body && !files.length) return;

    send({
      conversationId: activeConversationId,
      body: body || undefined,
      kind: files.length ? "attachment" : "text",
      files: files.length ? files : undefined,
      replyToId: toChatId(ui.replyingTo?.id) ?? undefined,
    });

    ui.setInput("");
    ui.setReplyingTo(null);
    ui.clearPendingFiles();
  }, [activeConversationId, ui, send]);

  const handleSchedule = useCallback(
    (_label: string, offsetMinutes: number) => {
      const body = ui.input.trim();
      if (!activeConversationId || !body) return;

      send({
        conversationId: activeConversationId,
        body,
        scheduledAt: new Date(Date.now() + offsetMinutes * 60_000).toISOString(),
        replyToId: toChatId(ui.replyingTo?.id) ?? undefined,
      });

      ui.setInput("");
      ui.setReplyingTo(null);
      ui.setShowSchedulePicker(false);
    },
    [activeConversationId, ui, send],
  );

  const handleSendVoice = useCallback(
    (durationSeconds: number, audio: Blob) => {
      if (!activeConversationId) return;

      const file = new File([audio], `voice-${Date.now()}.webm`, {
        type: audio.type || "audio/webm",
      });

      send({
        conversationId: activeConversationId,
        kind: "voice",
        files: [file],
        // Бэкенд ждёт длительность в миллисекундах.
        durations: [Math.max(1, Math.round(durationSeconds)) * 1000],
      });
      ui.setIsRecording(false);
    },
    [activeConversationId, ui, send],
  );

  const handleSendThread = useCallback(
    (parentMsgId: string, text: string) => {
      const threadParentId = toChatId(parentMsgId);
      if (!activeConversationId || !threadParentId || !text.trim()) return;

      send({
        conversationId: activeConversationId,
        body: text.trim(),
        threadParentId,
      });
    },
    [activeConversationId, send],
  );

  // Индикатор «печатает…» у собеседника включает ввод и гасит пустое поле.
  const handleInputChange = useCallback(
    (value: string) => {
      ui.setInput(value);
      if (value) notifyTyping();
      else stopTyping();
    },
    [ui, notifyTyping, stopTyping],
  );

  return {
    handleSend,
    handleSchedule,
    handleSendVoice,
    handleSendThread,
    handleInputChange,
  };
};
