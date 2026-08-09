import { useCallback } from "react";
import type { Message } from "../model";
import { toChatId } from "./useChatComposer";
import type { useChatData } from "./useChatData";
import type { useChatUiState } from "./useChatUiState";

// Действия над готовыми сообщениями и над самой беседой: реакции, закрепление,
// удаление, пересылка, звёздочка и заглушение уведомлений.

type TChatUi = ReturnType<typeof useChatUiState>;
type TChatData = ReturnType<typeof useChatData>;

/** Сутки — стандартный срок «не беспокоить»: бэкенд хранит дату, а не флаг. */
const MUTE_DURATION_MS = 24 * 60 * 60 * 1000;

export const useChatMessageHandlers = (
  ui: TChatUi,
  data: TChatData,
  messages: Message[],
) => {
  const {
    activeConversationId,
    activeContact,
    toggleReaction,
    togglePin,
    deleteMessage,
    forwardMessage,
    deleteConversation,
    updateSettings,
  } = data;

  const handleReaction = useCallback(
    (msgId: string, emoji: string) => {
      const messageId = toChatId(msgId);
      if (!messageId) return;

      const reaction = messages
        .find((message) => message.id === msgId)
        ?.reactions?.find((item) => item.emoji === emoji);

      toggleReaction(messageId, emoji, Boolean(reaction?.reactedByMe));
      ui.setHoveredMessageId(null);
    },
    [messages, toggleReaction, ui],
  );

  const handlePinMessage = useCallback(
    (msgId: string) => {
      const messageId = toChatId(msgId);
      if (!messageId) return;

      const isPinned = Boolean(
        messages.find((message) => message.id === msgId)?.pinned,
      );
      togglePin(messageId, isPinned);
      ui.setShowPinnedBanner(true);
    },
    [messages, togglePin, ui],
  );

  const handleDelete = useCallback(
    (scope: "me" | "everyone") => {
      const messageId = toChatId(ui.deletingMsgId);
      ui.setDeletingMsgId(null);
      if (!messageId) return;
      deleteMessage({ messageId, scope });
    },
    [ui, deleteMessage],
  );

  const handleForwardSend = useCallback(
    (targetContactId: string) => {
      const messageId = toChatId(ui.forwardingMsg?.id);
      const conversationId = toChatId(targetContactId);
      ui.setForwardingMsg(null);
      if (!messageId || !conversationId) return;
      forwardMessage({ messageId, conversationIds: [conversationId] });
    },
    [ui, forwardMessage],
  );

  const handleDeleteConversation = useCallback(
    (forEveryone = false) => {
      ui.setShowDeleteConversation(false);
      ui.setShowContactDrawer(false);
      if (!activeConversationId) return;
      deleteConversation({
        conversationId: activeConversationId,
        forEveryone,
      });
    },
    [ui, activeConversationId, deleteConversation],
  );

  const handleToggleStar = useCallback(() => {
    if (!activeConversationId) return;
    updateSettings({
      conversationId: activeConversationId,
      is_starred: !activeContact?.isStarred,
    });
  }, [activeConversationId, activeContact, updateSettings]);

  const handleToggleMute = useCallback(() => {
    if (!activeConversationId) return;
    updateSettings({
      conversationId: activeConversationId,
      muted_until: activeContact?.isMuted
        ? null
        : new Date(Date.now() + MUTE_DURATION_MS).toISOString(),
    });
  }, [activeConversationId, activeContact, updateSettings]);

  return {
    handleReaction,
    handlePinMessage,
    handleDeleteForMe: useCallback(() => handleDelete("me"), [handleDelete]),
    handleDeleteForEveryone: useCallback(
      () => handleDelete("everyone"),
      [handleDelete],
    ),
    handleForwardSend,
    handleDeleteConversation,
    handleToggleStar,
    handleToggleMute,
  };
};
