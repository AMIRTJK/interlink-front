import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "@shared/lib";
import { useChatUiState } from "./useChatUiState";
import { useCallState } from "./useCallState";
import { useChatData } from "./useChatData";
import { useChatComposer, toChatId } from "./useChatComposer";
import { useChatMessageHandlers } from "./useChatMessageHandlers";
import { useThreadReadState } from "./useThreadReadState";
import { ME, type IChatLabels } from "./chatMappers";
import { canDeleteForEveryone } from "./chatPermissions";
import { chatUrls } from "../api/chatUrls";
import type { Contact, IChatCursorPage, IChatMessage } from "../model";

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

  const canDeleteDeletingMsgForEveryone = useMemo(
    () => canDeleteForEveryone(deletingMsg, data.activeContact),
    [deletingMsg, data.activeContact],
  );

  /* ===================== ЭФФЕКТЫ ЛЕНТЫ ===================== */

  const { scrollRef, messageRefs, searchMatchIndex } = ui;

  const prevConversationIdRef = useRef<number | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const firstMessageIdRef = useRef<string | number | undefined>(undefined);
  const prevScrollHeightRef = useRef<number>(0);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const isChatSwitched = activeConversationId !== prevConversationIdRef.current;
    const currentFirstId = messages[0]?.id;
    const isPrepend =
      !isChatSwitched &&
      messages.length > prevMessagesLengthRef.current &&
      prevMessagesLengthRef.current > 0 &&
      currentFirstId !== firstMessageIdRef.current;

    if (isChatSwitched) {
      node.scrollTop = node.scrollHeight;
    } else if (isPrepend) {
      const deltaHeight = node.scrollHeight - prevScrollHeightRef.current;
      if (deltaHeight > 0) {
        node.scrollTop = node.scrollTop + deltaHeight;
      }
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
    prevScrollHeightRef.current = node.scrollHeight;
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

  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollBottom(false);
    }
  }, [scrollRef]);

  /** Догрузка старых сообщений при прокрутке ленты к началу и проверка кнопки "Вниз". */
  const { hasOlder, isLoadingOlder, loadOlder } = data;
  const handleMessagesScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const isScrolledUp =
      node.scrollHeight - node.scrollTop - node.clientHeight > 200;
    setShowScrollBottom(isScrolledUp);

    if (!hasOlder || isLoadingOlder) return;
    if (node.scrollTop > 80) return;
    void loadOlder();
  }, [scrollRef, hasOlder, isLoadingOlder, loadOlder]);

  const isHighlighted = (msgId: string) =>
    Boolean(ui.msgSearchQuery.trim()) &&
    searchMatches.some((message) => message.id === msgId);

  const isCurrentMatch = (msgId: string) =>
    searchMatches.length > 0 && searchMatches[searchMatchIndex]?.id === msgId;

  const { markThreadSeen, getUnreadThreadCount } = useThreadReadState();
  const queryClient = useQueryClient();

  // Непрочитанные ответы в ветках суммируются со счётчиком основного тела чата,
  // чтобы беседа во вкладке чатов подсвечивала новые сообщения в тредах.
  const contacts = useMemo<Contact[]>(() => {
    return data.contacts.map((contact) => {
      const convId = Number(contact.id);
      let threadUnread = 0;

      if (convId === data.activeConversationId) {
        data.messages.forEach((msg) => {
          const tc = msg.threadCount ?? 0;
          if (tc > 0) {
            threadUnread += getUnreadThreadCount(msg.id, tc);
          }
        });
      } else {
        const queryData = queryClient.getQueryData<
          { pages?: IChatCursorPage<IChatMessage>[] } | IChatCursorPage<IChatMessage>
        >([chatUrls.messages(convId), { per_page: 40 }, true]);

        if (queryData) {
          const pages =
            "pages" in queryData && Array.isArray(queryData.pages)
              ? queryData.pages
              : [queryData as IChatCursorPage<IChatMessage>];

          pages.forEach((page) => {
            page.data?.forEach((msg) => {
              const tc = msg.thread_count ?? 0;
              if (tc > 0) {
                threadUnread += getUnreadThreadCount(String(msg.id), tc);
              }
            });
          });
        }
      }

      if (threadUnread === 0) return contact;
      return {
        ...contact,
        unreadCount: (contact.unreadCount ?? 0) + threadUnread,
      };
    });
  }, [
    data.contacts,
    data.activeConversationId,
    data.messages,
    getUnreadThreadCount,
    queryClient,
  ]);

  const activeContact = useMemo<Contact | null>(() => {
    return (
      contacts.find((c) => c.id === String(data.activeConversationId)) ??
      data.activeContact
    );
  }, [contacts, data.activeConversationId, data.activeContact]);

  const totalUnread = useMemo(() => {
    const threadUnreadTotal = contacts.reduce(
      (sum, c) => sum + (c.unreadCount ?? 0),
      0,
    );
    return Math.max(data.counters.unread_messages, threadUnreadTotal);
  }, [contacts, data.counters.unread_messages]);

  return {
    ...ui,
    ...call,
    ...data,
    ...composer,
    ...handlers,
    contacts,
    activeContact,
    setSearchQuery: handleSearchChange,
    setInput: composer.handleInputChange,
    pinnedMessage,
    searchMatches,
    openThreadMsg,
    lastReceivedMessage,
    deletingMsg,
    canDeleteDeletingMsgForEveryone,
    totalUnread,
    markThreadSeen,
    getUnreadThreadCount,
    handleSearchPrev,
    handleSearchNext,
    handleJumpToPinned,
    handleContactSwitch,
    handleMessagesScroll,
    handleJumpToMessage,
    handleReturnToMessage,
    showScrollBottom,
    scrollToBottom,
    isHighlighted,
    isCurrentMatch,
  };
};

/**
 * Полное состояние чата: данные, UI-состояние и обработчики. Оболочки
 * оформлений получают его целиком и различаются только разметкой.
 */
export type TChatAppState = ReturnType<typeof useChatAppState>;
