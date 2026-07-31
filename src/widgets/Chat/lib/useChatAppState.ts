import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Contact,
  Message,
  MessageAttachment,
  PendingFile,
  ReplyPreview,
  LayoutPosition,
  EmojiCategory,
  initialMessages,
  mockContacts as contacts,
  mockContactMessages as contactMessages,
  EMOJI_CATEGORY_EMOJIS,
  EMOJI_CATEGORIES_KEYS,
} from "../model";
import { Lang, TRANSLATIONS } from "./translations";
import { formatTime } from "./chatHelpers";

export const useChatAppState = (onComposeStateChange?: (isOpen: boolean) => void) => {
  const [isSystemDark, setIsSystemDark] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return document.documentElement.classList.contains("dark");
  });
  const isDark = isSystemDark;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsSystemDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const [lang, setLang] = useState<Lang>("en");
  const [layout, setLayout] = useState<LayoutPosition>("left");
  const t = TRANSLATIONS[lang];

  const cycleLang = () =>
    setLang((prev: Lang) => (prev === "en" ? "ru" : prev === "ru" ? "tg" : "en"));

  const LANG_LABELS: Record<Lang, string> = {
    en: "EN",
    ru: "RU",
    tg: "TG",
  };

  const EMOJI_CATEGORIES_LOCALIZED: EmojiCategory[] = EMOJI_CATEGORY_EMOJIS.map(
    (emojis, i) => ({
      label: t[EMOJI_CATEGORIES_KEYS[i]],
      emojis,
    }),
  );

  const SCHEDULE_OPTIONS_LOCALIZED = [
    { label: t.in1Hour, offset: 60 },
    { label: t.in3Hours, offset: 180 },
    { label: t.tomorrow9am, offset: 840 },
    { label: t.tomorrow6pm, offset: 1080 },
    { label: t.monday9am, offset: 2880 },
  ];

  const [activeContactId, setActiveContactId] = useState<string>("7");
  const [prevContactId, setPrevContactId] = useState<string | null>(null);
  const [switchDirection, setSwitchDirection] = useState<1 | -1>(1);
  const [messages] = useState<Message[]>(initialMessages);
  const [allMessages, setAllMessages] =
    useState<Record<string, Message[]>>(contactMessages);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [callState, setCallState] = useState<"none" | "audio" | "video">("none");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [incomingCall, setIncomingCall] = useState<{
    callType: "audio" | "video";
  } | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);

  useEffect(() => {
    onComposeStateChange?.(showComposeModal);
  }, [showComposeModal, onComposeStateChange]);

  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [activeActionMsgId, setActiveActionMsgId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [openThreadMsgId, setOpenThreadMsgId] = useState<string | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [viewingStory, setViewingStory] = useState<Contact | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [showDeleteConversation, setShowDeleteConversation] = useState(false);
  const [contactUnreads, setContactUnreads] = useState<Record<string, number>>(
    () => {
      const map: Record<string, number> = {};
      contacts.forEach((c) => {
        if (c.unreadCount) map[c.id] = c.unreadCount;
      });
      return map;
    },
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeContact =
    contacts.find((c) => c.id === activeContactId) || contacts[6];
  const currentMessages = allMessages[activeContactId] || [];
  const pinnedMessage = currentMessages.find((m) => m.pinned);
  const searchMatches = msgSearchQuery.trim()
    ? currentMessages.filter((m) =>
        m.text.toLowerCase().includes(msgSearchQuery.toLowerCase()),
      )
    : [];
  const openThreadMsg = openThreadMsgId
    ? currentMessages.find((m) => m.id === openThreadMsgId) || null
    : null;
  const lastReceivedMessage = [...currentMessages]
    .reverse()
    .find((m) => m.senderId !== "me");
  const deletingMsg = deletingMsgId
    ? currentMessages.find((m) => m.id === deletingMsgId) || null
    : null;
  const totalUnread = Object.values(contactUnreads).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentMessages, isTyping, activeContactId]);

  useEffect(() => {
    if (callState === "none") {
      setCallDuration(0);
      return;
    }
    const iv = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(iv);
  }, [callState]);

  useEffect(() => {
    setShowContactDrawer(false);
    setOpenThreadMsgId(null);
  }, [activeContactId]);

  useEffect(() => {
    if (searchMatches.length > 0 && searchMatchIndex < searchMatches.length) {
      const el = messageRefs.current[searchMatches[searchMatchIndex].id];
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  }, [searchMatchIndex, searchMatches.length]);

  useEffect(() => {
    setContactUnreads((prev) => {
      const n = { ...prev };
      delete n[activeContactId];
      return n;
    });
  }, [activeContactId]);

  const handleContactSwitch = (newId: string) => {
    if (newId === activeContactId) return;
    const currentIdx = contacts.findIndex((c) => c.id === activeContactId);
    const newIdx = contacts.findIndex((c) => c.id === newId);
    setSwitchDirection(newIdx > currentIdx ? 1 : -1);
    setPrevContactId(activeContactId);
    setActiveContactId(newId);
    setShowPinnedBanner(true);
    setIsTyping(false);
  };

  const handleSearchPrev = () =>
    setSearchMatchIndex(
      (i) => (i - 1 + searchMatches.length) % Math.max(searchMatches.length, 1),
    );
  const handleSearchNext = () =>
    setSearchMatchIndex((i) => (i + 1) % Math.max(searchMatches.length, 1));
  const handleMsgSearchChange = (v: string) => {
    setMsgSearchQuery(v);
    setSearchMatchIndex(0);
  };

  const handleSend = useCallback(() => {
    if (!input.trim() && pendingFiles.length === 0) return;
    const newMessages = [...(allMessages[activeContactId] || [])];
    if (pendingFiles.length > 0) {
      pendingFiles.forEach((f) => {
        newMessages.push({
          id: `m${Date.now()}-${f.name}`,
          senderId: "me",
          text: input.trim() || "",
          time: formatTime(new Date()),
          status: "sent",
          attachment: {
            name: f.name,
            size: f.size,
            type: f.type,
            preview: f.preview,
          },
          replyTo: replyingTo || undefined,
        });
      });
      setAllMessages((prev) => ({
        ...prev,
        [activeContactId]: newMessages,
      }));
      setPendingFiles([]);
      setInput("");
      setReplyingTo(null);
      return;
    }
    newMessages.push({
      id: `m${Date.now()}`,
      senderId: "me",
      text: input.trim(),
      time: formatTime(new Date()),
      status: "sent",
      replyTo: replyingTo || undefined,
    });
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: newMessages,
    }));
    setInput("");
    setReplyingTo(null);
    setIsTyping(false);
    const cid = activeContactId;
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setAllMessages((prev) => ({
          ...prev,
          [cid]: [
            ...(prev[cid] || []),
            {
              id: `m${Date.now() + 1}`,
              senderId: cid,
              text: "That's interesting! Tell me more about it.",
              time: formatTime(new Date()),
            },
          ],
        }));
        setIsTyping(false);
      }, 1800);
    }, 900);
  }, [input, pendingFiles, replyingTo, activeContactId, allMessages]);

  const handleSchedule = (label: string, _offset: number) => {
    if (!input.trim()) return;
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          id: `m${Date.now()}-sched`,
          senderId: "me",
          text: input.trim(),
          time: formatTime(new Date()),
          status: "sent",
          scheduled: true,
          scheduledTime: label,
        },
      ],
    }));
    setInput("");
    setReplyingTo(null);
  };

  const handleSendVoice = (duration: number) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [
        ...(prev[activeContactId] || []),
        {
          id: `m${Date.now()}-voice`,
          senderId: "me",
          text: "",
          time: formatTime(new Date()),
          status: "sent",
          attachment: {
            name: "Voice message",
            size: "",
            type: "voice",
            duration,
          },
        },
      ],
    }));
    setIsRecording(false);
  };

  const handleForwardSend = (targetId: string) => {
    if (!forwardingMsg) return;
    if (targetId === activeContactId) {
      setAllMessages((prev) => ({
        ...prev,
        [activeContactId]: [
          ...(prev[activeContactId] || []),
          {
            id: `m${Date.now()}-fwd`,
            senderId: "me",
            text: forwardingMsg.text,
            time: formatTime(new Date()),
            status: "sent",
            forwarded: true,
          },
        ],
      }));
    }
    setForwardingMsg(null);
  };

  const handleDeleteForMe = useCallback(() => {
    const msgId = deletingMsgId;
    if (!msgId) return;
    setDeletingMsgId(null);
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              deletedForMe: true,
              text: t.youDeletedThis,
            }
          : m,
      ),
    }));
  }, [deletingMsgId, t.youDeletedThis, activeContactId]);

  const handleDeleteForEveryone = useCallback(() => {
    const msgId = deletingMsgId;
    if (!msgId) return;
    setDeletingMsgId(null);
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              deleted: true,
              text: t.messageDeleted,
            }
          : m,
      ),
    }));
  }, [deletingMsgId, t.messageDeleted, activeContactId]);

  const handleDeleteConversation = () => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: [],
    }));
    setShowDeleteConversation(false);
    setShowContactDrawer(false);
  };

  const handleSendThread = (msgId: string, text: string) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((m) =>
        m.id === msgId
          ? {
              ...m,
              threadMessages: [
                ...(m.threadMessages || []),
                {
                  id: `${msgId}-t${Date.now()}`,
                  senderId: "me",
                  text,
                  time: formatTime(new Date()),
                  status: "sent" as const,
                },
              ],
              threadCount: (m.threadCount || 0) + 1,
            }
          : m,
      ),
    }));
  };

  const handlePinMessage = (msgId: string) => {
    setAllMessages((prev) => {
      const messages = prev[activeContactId] || [];
      const targetMsg = messages.find((m) => m.id === msgId);
      const isAlreadyPinned = !!(targetMsg && targetMsg.pinned);
      return {
        ...prev,
        [activeContactId]: messages.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              pinned: !isAlreadyPinned,
            };
          }
          return {
            ...m,
            pinned: false,
          };
        }),
      };
    });
    setShowPinnedBanner(true);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setAllMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map((msg) => {
        if (msg.id !== msgId) return msg;
        const existing = (msg.reactions || []).find((r) => r.emoji === emoji);
        if (existing) {
          const updated = msg
            .reactions!.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.reactedByMe ? r.count - 1 : r.count + 1,
                    reactedByMe: !r.reactedByMe,
                  }
                : r,
            )
            .filter((r) => r.count > 0);
          return {
            ...msg,
            reactions: updated,
          };
        }
        return {
          ...msg,
          reactions: [
            ...(msg.reactions || []),
            {
              emoji,
              count: 1,
              reactedByMe: true,
            },
          ],
        };
      }),
    }));
    setHoveredMessageId(null);
  };

  const handleEmojiSelect = (emoji: string) => setInput((prev) => prev + emoji);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const mapped: PendingFile[] = selected.map((file) => {
      const sizeKb = file.size / 1024;
      const sizeStr =
        sizeKb > 1024
          ? `${(sizeKb / 1024).toFixed(1)} MB`
          : `${sizeKb.toFixed(0)} KB`;
      let type: MessageAttachment["type"] = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";
      const entry: PendingFile = {
        name: file.name,
        size: sizeStr,
        type,
        raw: file,
      };
      if (type === "image") entry.preview = URL.createObjectURL(file);
      return entry;
    });
    setPendingFiles((prev) => [...prev, ...mapped]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingFile = (name: string) => {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.name === name);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.name !== name);
    });
  };

  const handleJumpToPinned = () => {
    if (pinnedMessage) {
      const el = messageRefs.current[pinnedMessage.id];
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setCallState(incomingCall.callType);
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => setIncomingCall(null);

  const handleEndCall = () => {
    setCallState("none");
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const isHighlighted = (msgId: string) =>
    Boolean(msgSearchQuery.trim()) && searchMatches.some((m) => m.id === msgId);

  const isCurrentMatch = (msgId: string) =>
    searchMatches.length > 0 && searchMatches[searchMatchIndex]?.id === msgId;

  return {
    isDark,
    lang,
    setLang,
    layout,
    setLayout,
    t,
    cycleLang,
    LANG_LABELS,
    EMOJI_CATEGORIES_LOCALIZED,
    SCHEDULE_OPTIONS_LOCALIZED,
    activeContactId,
    setActiveContactId,
    prevContactId,
    switchDirection,
    messages,
    allMessages,
    input,
    setInput,
    searchQuery,
    setSearchQuery,
    isTyping,
    callState,
    setCallState,
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff,
    callDuration,
    showEmojiPicker,
    setShowEmojiPicker,
    pendingFiles,
    incomingCall,
    setIncomingCall,
    hoveredMessageId,
    setHoveredMessageId,
    showContactDrawer,
    setShowContactDrawer,
    showMsgSearch,
    setShowMsgSearch,
    msgSearchQuery,
    searchMatchIndex,
    showPinnedBanner,
    setShowPinnedBanner,
    showComposeModal,
    setShowComposeModal,
    isRecording,
    setIsRecording,
    replyingTo,
    setReplyingTo,
    forwardingMsg,
    setForwardingMsg,
    activeActionMsgId,
    setActiveActionMsgId,
    showAIPanel,
    setShowAIPanel,
    openThreadMsgId,
    setOpenThreadMsgId,
    showSchedulePicker,
    setShowSchedulePicker,
    viewingStory,
    setViewingStory,
    deletingMsgId,
    setDeletingMsgId,
    showDeleteConversation,
    setShowDeleteConversation,
    contactUnreads,
    fileInputRef,
    scrollRef,
    messageRefs,
    activeContact,
    currentMessages,
    pinnedMessage,
    searchMatches,
    openThreadMsg,
    lastReceivedMessage,
    deletingMsg,
    totalUnread,
    handleContactSwitch,
    handleSearchPrev,
    handleSearchNext,
    handleMsgSearchChange,
    handleSend,
    handleSchedule,
    handleSendVoice,
    handleForwardSend,
    handleDeleteForMe,
    handleDeleteForEveryone,
    handleDeleteConversation,
    handleSendThread,
    handlePinMessage,
    handleReaction,
    handleEmojiSelect,
    handleFileChange,
    removePendingFile,
    handleJumpToPinned,
    handleAcceptCall,
    handleDeclineCall,
    handleEndCall,
    isHighlighted,
    isCurrentMatch,
  };
};
