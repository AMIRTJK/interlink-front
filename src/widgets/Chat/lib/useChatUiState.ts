import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIsDarkMode } from "@shared/lib";
import type {
  EmojiCategory,
  Contact,
  Message,
  MessageAttachment,
  PendingFile,
  ReplyPreview,
  LayoutPosition,
} from "../model";
import { EMOJI_CATEGORIES_KEYS, EMOJI_CATEGORY_EMOJIS } from "../model";
import { Lang, TRANSLATIONS } from "./translations";
import { formatFileSize } from "./chatFormat";

// Состояние интерфейса чата: язык, раскладка, открытые панели, выбор файлов.
// Ничего не знает о бэкенде — данные живут в api/ и приходят в компонент рядом.

const LANG_LABELS: Record<Lang, string> = { en: "EN", ru: "RU", tg: "TG" };

/** Отложенная отправка: смещения в минутах от текущего момента. */
const SCHEDULE_OFFSETS = [60, 180, 840, 1080, 2880] as const;

export const useChatUiState = (
  onComposeStateChange?: (isOpen: boolean) => void,
) => {
  const isDark = useIsDarkMode();
  const [lang, setLang] = useState<Lang>("ru");
  const [layout, setLayout] = useState<LayoutPosition>("left");
  const t = TRANSLATIONS[lang];

  const cycleLang = () =>
    setLang((prev) => (prev === "en" ? "ru" : prev === "ru" ? "tg" : "en"));

  const EMOJI_CATEGORIES_LOCALIZED: EmojiCategory[] = useMemo(
    () =>
      EMOJI_CATEGORY_EMOJIS.map((emojis, i) => ({
        label: t[EMOJI_CATEGORIES_KEYS[i]],
        emojis,
      })),
    [t],
  );

  const SCHEDULE_OPTIONS_LOCALIZED = useMemo(
    () =>
      [t.in1Hour, t.in3Hours, t.tomorrow9am, t.tomorrow6pm, t.monday9am].map(
        (label, i) => ({ label, offset: SCHEDULE_OFFSETS[i] }),
      ),
    [t],
  );

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [searchMatchIndex, setSearchMatchIndex] = useState(0);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<Message | null>(null);
  const [activeActionMsgId, setActiveActionMsgId] = useState<string | null>(null);
  const [openThreadMsgId, setOpenThreadMsgId] = useState<string | null>(null);
  const [viewingStory, setViewingStory] = useState<Contact | null>(null);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const [showDeleteConversation, setShowDeleteConversation] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [targetHighlightedMessageId, setTargetHighlightedMessageId] = useState<string | null>(null);
  const [returnToMessageId, setReturnToMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    onComposeStateChange?.(showComposeModal);
  }, [showComposeModal, onComposeStateChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const mapped: PendingFile[] = selected.map((file) => {
      let type: MessageAttachment["type"] = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";

      const entry: PendingFile = {
        name: file.name,
        size: formatFileSize(file.size),
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

  const clearPendingFiles = () => {
    setPendingFiles((prev) => {
      prev.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      return [];
    });
  };

  const handleEmojiSelect = (emoji: string) => setInput((prev) => prev + emoji);

  /** Ссылки на узлы сообщений: нужны для перехода к закреплённому и к совпадению поиска. */
  const setMessageRef = (id: string, el: HTMLDivElement | null) => {
    messageRefs.current[id] = el;
  };

  const handleMsgSearchChange = (value: string) => {
    setMsgSearchQuery(value);
    setSearchMatchIndex(0);
  };

  return {
    isDark,
    lang,
    setLang,
    cycleLang,
    LANG_LABELS,
    layout,
    setLayout,
    t,
    EMOJI_CATEGORIES_LOCALIZED,
    SCHEDULE_OPTIONS_LOCALIZED,
    input,
    setInput,
    searchQuery,
    setSearchQuery,
    showEmojiPicker,
    setShowEmojiPicker,
    showSchedulePicker,
    setShowSchedulePicker,
    showAIPanel,
    setShowAIPanel,
    showComposeModal,
    setShowComposeModal,
    showGroupModal,
    setShowGroupModal,
    showContactDrawer,
    setShowContactDrawer,
    showMsgSearch,
    setShowMsgSearch,
    msgSearchQuery,
    handleMsgSearchChange,
    searchMatchIndex,
    setSearchMatchIndex,
    showPinnedBanner,
    setShowPinnedBanner,
    isRecording,
    setIsRecording,
    replyingTo,
    setReplyingTo,
    forwardingMsg,
    setForwardingMsg,
    activeActionMsgId,
    setActiveActionMsgId,
    openThreadMsgId,
    setOpenThreadMsgId,
    viewingStory,
    setViewingStory,
    deletingMsgId,
    setDeletingMsgId,
    showDeleteConversation,
    setShowDeleteConversation,
    hoveredMessageId,
    setHoveredMessageId,
    pendingFiles,
    handleFileChange,
    removePendingFile,
    clearPendingFiles,
    handleEmojiSelect,
    fileInputRef,
    scrollRef,
    messageRefs,
    setMessageRef,
    targetHighlightedMessageId,
    setTargetHighlightedMessageId,
    returnToMessageId,
    setReturnToMessageId,
  };
};
