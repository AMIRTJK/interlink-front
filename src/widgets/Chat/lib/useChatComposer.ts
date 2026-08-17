import { useCallback } from "react";
import { ME, type Message, type MessageAttachment } from "../model";
import { formatFileSize, formatMessageTime } from "./chatFormat";
import type { useChatData } from "./useChatData";
import type { useChatUiState } from "./useChatUiState";

// Отправка сообщений: текст, вложения, голосовое, отложенная отправка и ответы
// в треде. Всё уходит одной ручкой POST /conversations/{id}/messages.
// На фронтенде используется Optimistic UI — сообщение мгновенно появляется на экране
// и формы очищаются, не дожидаясь ответа от бэкенда (без задержки в 3 секунды).

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
    addOptimisticMessage,
    removeOptimisticMessage,
    currentUserAvatar,
    labels,
  } = data;

  const send = useCallback(
    (
      payload: Omit<Parameters<typeof sendMessage>[0], "clientUuid"> & {
        clientUuid?: string;
      },
      /** Оптимистичное сообщение этой отправки: при ошибке его нужно убрать,
          иначе на нём навсегда останутся часы «отправляется». */
      optimisticId?: string,
    ) => {
      stopTyping();
      sendMessage(
        {
          ...payload,
          clientUuid: payload.clientUuid ?? createClientUuid(),
        },
        optimisticId
          ? { onError: () => removeOptimisticMessage(optimisticId) }
          : undefined,
      );
    },
    [sendMessage, stopTyping, removeOptimisticMessage],
  );

  const handleSend = useCallback(() => {
    if (!activeConversationId) return;
    const body = ui.input.trim();
    const files = ui.pendingFiles.map((file) => file.raw);
    if (!body && !files.length) return;

    const clientUuid = createClientUuid();
    const tempId = `temp-${clientUuid}`;

    // Превью берём своей ссылкой на тот же файл: очередь вложений очищается
    // сразу после отправки и освобождает свои blob-URL, поэтому переданная из
    // неё ссылка умерла бы до первой отрисовки картинки.
    const optimisticAttachments: MessageAttachment[] = ui.pendingFiles.map((pf, idx) => ({
      attachmentId: Date.now() + idx,
      name: pf.name,
      size: pf.size,
      type: pf.type,
      preview: pf.preview ? URL.createObjectURL(pf.raw) : undefined,
    }));

    const optimisticMsg: Message = {
      id: tempId,
      clientUuid,
      senderId: ME,
      senderName: labels?.you || "Вы",
      senderAvatar: currentUserAvatar,
      text: body,
      time: formatMessageTime(new Date().toISOString()),
      status: "pending",
      attachment: optimisticAttachments[0],
      attachments: optimisticAttachments.length ? optimisticAttachments : undefined,
      replyTo: ui.replyingTo ?? undefined,
    };

    // 1. Мгновенная отрисовка на фронтенде (0 ms!)
    addOptimisticMessage(optimisticMsg);

    // 2. Мгновенная очистка полей ввода (0 ms!)
    ui.setInput("");
    ui.setReplyingTo(null);
    ui.clearPendingFiles();

    // 3. Запрос к бэкенду отправляется параллельно в фоновом режиме
    send(
      {
        conversationId: activeConversationId,
        body: body || undefined,
        kind: files.length ? "attachment" : "text",
        files: files.length ? files : undefined,
        replyToId: toChatId(ui.replyingTo?.id) ?? undefined,
        clientUuid,
      },
      tempId,
    );
  }, [activeConversationId, ui, send, addOptimisticMessage, currentUserAvatar, labels]);

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

      const clientUuid = createClientUuid();
      const tempId = `temp-voice-${clientUuid}`;
      const previewUrl = URL.createObjectURL(audio);
      const voiceAttachment: MessageAttachment = {
        attachmentId: Date.now(),
        name: "Voice message",
        size: formatFileSize(audio.size),
        type: "voice",
        url: previewUrl,
        durationSeconds,
      };

      const optimisticMsg: Message = {
        id: tempId,
        clientUuid,
        senderId: ME,
        senderName: labels?.you || "Вы",
        senderAvatar: currentUserAvatar,
        text: "",
        time: formatMessageTime(new Date().toISOString()),
        // Запись ещё загружается — статус тот же, что у остальных вложений,
        // иначе индикатор отправки на пузыре противоречил бы данным сообщения.
        status: "pending",
        attachment: voiceAttachment,
        attachments: [voiceAttachment],
      };

      addOptimisticMessage(optimisticMsg);
      ui.setIsRecording(false);

      const file = new File([audio], `voice-${Date.now()}.webm`, {
        type: audio.type || "audio/webm",
      });

      send(
        {
          conversationId: activeConversationId,
          kind: "voice",
          files: [file],
          durations: [Math.max(1, Math.round(durationSeconds)) * 1000],
          clientUuid,
        },
        tempId,
      );
    },
    [activeConversationId, send, addOptimisticMessage, currentUserAvatar, labels, ui],
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
