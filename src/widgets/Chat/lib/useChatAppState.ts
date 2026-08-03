import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "@shared/lib";
import { useChatUiState } from "./useChatUiState";
import { useCallState } from "./useCallState";
import { useChatData } from "./useChatData";
import { useChatComposer, toChatId } from "./useChatComposer";
import { useChatMessageHandlers } from "./useChatMessageHandlers";
import { ME, type IChatLabels } from "./chatMappers";

// Композиция чата: UI-состояние (useChatUiState) + серверные данные (useChatData)
// + обработчики, связывающие одно с другим. Разметку рисует ChatApp.

const SEARCH_DEBOUNCE_MS = 400;

export const useChatAppState = (
  onComposeStateChange?: (isOpen: boolean) => void,
  /** Чат виден пользователю: закрытая модалка не должна ничего грузить. */
  isActive = true,
) => {
  const ui = useChatUiState(onComposeStateChange);
  const call = useCallState();

  const [searchTerm, setSearchTerm] = useState("");
  const applySearch = useDebouncedCallback(
    ((value: string) => setSearchTerm(value)) as (...args: unknown[]) => void,
    SEARCH_DEBOUNCE_MS,
  );

  const { setSearchQuery } = ui;
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      applySearch(value);
    },
    [setSearchQuery, applySearch],
  );

  const labels = useMemo<IChatLabels>(
    () => ({
      deleted: ui.t.messageDeleted,
      deletedForMe: ui.t.youDeletedThis,
      attachment: ui.t.attachmentLabel,
      voiceMessage: ui.t.voiceMessage,
      you: ui.t.you,
    }),
    [ui.t],
  );

  const data = useChatData({
    isEnabled: isActive,
    search: searchTerm,
    labels,
    threadMessageId: toChatId(ui.openThreadMsgId),
  });

  const { messages, activeConversationId } = data;
  const composer = useChatComposer(ui, data);
  const handlers = useChatMessageHandlers(ui, data, messages);

  /* ===================== ПРОИЗВОДНЫЕ ОТ ЛЕНТЫ ===================== */

  const pinnedMessage = useMemo(
    () => messages.find((message) => message.pinned),
    [messages],
  );

  const searchMatches = useMemo(() => {
    const query = ui.msgSearchQuery.trim().toLowerCase();
    if (!query) return [];
    return messages.filter((message) =>
      message.text.toLowerCase().includes(query),
    );
  }, [messages, ui.msgSearchQuery]);

  const openThreadMsg = useMemo(
    () => messages.find((message) => message.id === ui.openThreadMsgId) ?? null,
    [messages, ui.openThreadMsgId],
  );

  const lastReceivedMessage = useMemo(
    () => [...messages].reverse().find((message) => message.senderId !== ME),
    [messages],
  );

  const deletingMsg = useMemo(
    () => messages.find((message) => message.id === ui.deletingMsgId) ?? null,
    [messages, ui.deletingMsgId],
  );

  /* ===================== ЭФФЕКТЫ ЛЕНТЫ ===================== */

  const { scrollRef, messageRefs, searchMatchIndex } = ui;

  const prevConversationIdRef = useRef<number | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const firstMessageIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const isChatSwitched = activeConversationId !== prevConversationIdRef.current;
    const currentFirstId = messages[0]?.id;
    const isPrepend =
      !isChatSwitched &&
      messages.length > prevMessagesLengthRef.current &&
      currentFirstId !== firstMessageIdRef.current;

    if (isChatSwitched) {
      node.scrollTop = node.scrollHeight;
    } else if (isPrepend) {
      // Сохраняем положение скролла при догрузке старых сообщений вверх
    } else if (messages.length > prevMessagesLengthRef.current) {
      const lastMsg = messages[messages.length - 1];
      const isNearBottom =
        node.scrollHeight - node.scrollTop - node.clientHeight < 180;
      if (lastMsg?.senderId === ME || isNearBottom) {
        node.scrollTop = node.scrollHeight;
      }
    }

    prevConversationIdRef.current = activeConversationId;
    prevMessagesLengthRef.current = messages.length;
    firstMessageIdRef.current = currentFirstId;
  }, [messages, activeConversationId, scrollRef]);

  useEffect(() => {
    if (!searchMatches.length || searchMatchIndex >= searchMatches.length) return;
    messageRefs.current[searchMatches[searchMatchIndex].id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [searchMatchIndex, searchMatches, messageRefs]);

  const {
    setShowContactDrawer,
    setOpenThreadMsgId,
    setSearchMatchIndex,
    setReturnToMessageId,
    setTargetHighlightedMessageId,
  } = ui;
  useEffect(() => {
    setShowContactDrawer(false);
    setOpenThreadMsgId(null);
    setReturnToMessageId(null);
    setTargetHighlightedMessageId(null);
  }, [
    activeConversationId,
    setShowContactDrawer,
    setOpenThreadMsgId,
    setReturnToMessageId,
    setTargetHighlightedMessageId,
  ]);

  /* ===================== ПОИСК ПО ЛЕНТЕ И НАВИГАЦИЯ ===================== */

  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleJumpToMessage = useCallback(
    (targetId: string | number, returnFromId?: string | number) => {
      const targetStr = String(targetId);
      const returnFromStr = returnFromId ? String(returnFromId) : null;
      console.log("[handleJumpToMessage] EXECUTED", {
        targetId,
        returnFromId,
        targetStr,
        returnFromStr,
        messageRefsKeys: Object.keys(messageRefs.current),
      });

      // Всегда взводим возврат к сообщению и подсветку
      if (returnFromStr && returnFromStr !== targetStr) {
        console.log("[handleJumpToMessage] Setting returnToMessageId:", returnFromStr);
        setReturnToMessageId(returnFromStr);
      }
      console.log("[handleJumpToMessage] Setting targetHighlightedMessageId:", targetStr);
      setTargetHighlightedMessageId(targetStr);

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => {
        console.log("[handleJumpToMessage] Clearing highlight for", targetStr);
        setTargetHighlightedMessageId(null);
      }, 3000);

      // Ищем DOM узел во всех реестрах и селекторах
      const el =
        messageRefs.current[targetStr] ||
        messageRefs.current[Number(targetStr)] ||
        document.getElementById(`chat-msg-${targetStr}`) ||
        (scrollRef.current?.querySelector(`[data-msg-id="${targetStr}"]`) as HTMLDivElement | null);

      console.log("[handleJumpToMessage] Found DOM element?", Boolean(el), el);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.warn("[handleJumpToMessage] Element NOT found in DOM for ID:", targetStr);
      }
    },
    [messageRefs, scrollRef, setReturnToMessageId, setTargetHighlightedMessageId],
  );

  const handleReturnToMessage = useCallback(() => {
    const returnId = ui.returnToMessageId;
    console.log("[handleReturnToMessage] EXECUTED, returnId:", returnId);
    if (!returnId) return;

    const returnStr = String(returnId);
    setTargetHighlightedMessageId(returnStr);
    setReturnToMessageId(null);

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => {
      setTargetHighlightedMessageId(null);
    }, 2000);

    const el =
      messageRefs.current[returnStr] ||
      messageRefs.current[Number(returnStr)] ||
      document.getElementById(`chat-msg-${returnStr}`) ||
      (scrollRef.current?.querySelector(`[data-msg-id="${returnStr}"]`) as HTMLDivElement | null);

    console.log("[handleReturnToMessage] Found return DOM element?", Boolean(el), el);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [messageRefs, scrollRef, ui.returnToMessageId, setReturnToMessageId, setTargetHighlightedMessageId]);

  const handleSearchPrev = () =>
    setSearchMatchIndex(
      (i) => (i - 1 + searchMatches.length) % Math.max(searchMatches.length, 1),
    );

  const handleSearchNext = () =>
    setSearchMatchIndex((i) => (i + 1) % Math.max(searchMatches.length, 1));

  const handleJumpToPinned = () => {
    if (!pinnedMessage) return;
    handleJumpToMessage(pinnedMessage.id);
  };

  const { selectConversation } = data;
  const { setShowPinnedBanner } = ui;
  const handleContactSwitch = useCallback(
    (contactId: string) => {
      selectConversation(contactId);
      setShowPinnedBanner(true);
    },
    [selectConversation, setShowPinnedBanner],
  );

  /** Догрузка старых сообщений при прокрутке ленты к началу. */
  const { hasOlder, isLoadingOlder, loadOlder } = data;
  const handleMessagesScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node || !hasOlder || isLoadingOlder) return;
    if (node.scrollTop > 80) return;
    void loadOlder();
  }, [scrollRef, hasOlder, isLoadingOlder, loadOlder]);

  const isHighlighted = (msgId: string) =>
    Boolean(ui.msgSearchQuery.trim()) &&
    searchMatches.some((message) => message.id === msgId);

  const isCurrentMatch = (msgId: string) =>
    searchMatches.length > 0 && searchMatches[searchMatchIndex]?.id === msgId;

  return {
    ...ui,
    ...call,
    ...data,
    ...composer,
    ...handlers,
    setSearchQuery: handleSearchChange,
    setInput: composer.handleInputChange,
    pinnedMessage,
    searchMatches,
    openThreadMsg,
    lastReceivedMessage,
    deletingMsg,
    totalUnread: data.counters.unread_messages,
    handleSearchPrev,
    handleSearchNext,
    handleJumpToPinned,
    handleContactSwitch,
    handleMessagesScroll,
    handleJumpToMessage,
    handleReturnToMessage,
    isHighlighted,
    isCurrentMatch,
  };
};
