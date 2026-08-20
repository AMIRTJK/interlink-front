import React, { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock3, CornerUpLeft, Forward, MoreHorizontal, Pin, MessageSquare } from "lucide-react";
import { Contact, Message, ReplyPreview } from "../../model";
import { Lang, Translations } from "../../lib/translations";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import { getMessageBubbleStyle } from "../../lib/messageBubbleStyle";
import { If } from "@shared/ui";
import { MessageAttachments } from "./MessageAttachments";
import { ReactionPicker } from "./ReactionPicker";
import { MessageActionMenu } from "./MessageActionMenu";
import { MessageLinkPreview } from "./MessageLinkPreview";
import { MessageMeta } from "./MessageMeta";
import { useChatThemePresentation } from "../../lib/chatThemeStore";

interface ChatMessageItemProps {
  msg: Message;
  isMe: boolean;
  activeContact: Contact;
  hoveredMessageId?: string | null;
  activeActionMsgId?: string | null;
  isDark: boolean;
  lang: Lang;
  t: Translations;
  highlighted: boolean;
  currentMatchMsg: boolean;
  setHoveredMessageId: (id: string | null) => void;
  setActiveActionMsgId: React.Dispatch<React.SetStateAction<string | null>>;
  handleReaction: (msgId: string, emoji: string) => void;
  handlePinMessage: (msgId: string) => void;
  setReplyingTo: (reply: ReplyPreview | null) => void;
  setForwardingMsg: (msg: Message | null) => void;
  setDeletingMsgId: (id: string | null) => void;
  setOpenThreadMsgId: (id: string | null) => void;
  setShowContactDrawer: (show: boolean) => void;
  formatRepliesCount: (count: number, lang: Lang) => string;
  /** Сколько ответов треда человек ещё не видел. */
  getUnreadThreadCount: (msgId: string, repliesCount: number) => number;
  setMessageRef: (id: string, el: HTMLDivElement | null) => void;
  targetHighlightedMessageId?: string | null;
  onJumpToMessage?: (targetId: string, returnFromId?: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  msg,
  isMe,
  activeContact,
  hoveredMessageId,
  activeActionMsgId,
  isDark,
  lang,
  t,
  highlighted,
  currentMatchMsg,
  targetHighlightedMessageId,
  onJumpToMessage,
  setHoveredMessageId,
  setActiveActionMsgId,
  handleReaction,
  handlePinMessage,
  setReplyingTo,
  setForwardingMsg,
  setDeletingMsgId,
  setOpenThreadMsgId,
  setShowContactDrawer,
  formatRepliesCount,
  getUnreadThreadCount,
  setMessageRef,
}) => {
  const { messageMeta, bubbleAvatars } = useChatThemePresentation();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [actionMenuRect, setActionMenuRect] = useState<DOMRect | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleWidth, setBubbleWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = bubbleRef.current;
    if (!node) return;

    const updateWidth = () => {
      if (node.offsetWidth > 0) {
        setBubbleWidth(node.offsetWidth);
      }
    };

    updateWidth();

    const ro = new ResizeObserver(() => {
      updateWidth();
    });
    ro.observe(node);

    return () => ro.disconnect();
  }, []);

  if (msg.deleted || msg.deletedForMe) return null;

  const repliesCount = msg.threadCount || 0;
  const unreadReplies = getUnreadThreadCount(msg.id, repliesCount);

  const isTargetHighlighted =
    Boolean(targetHighlightedMessageId) &&
    String(targetHighlightedMessageId) === String(msg.id);

  const isPending = msg.status === "pending" || msg.id.startsWith("temp-");

  // Статус на пузыре вложения: часы, пока сообщение уходит, затем галочка — то
  // же поведение, что у строки времени текста. У чужих сообщений статуса нет, а
  // у своих с подписью его несёт эта самая строка, поэтому дубль не рисуем.
  let attachmentStatus: NonNullable<Message["status"]> | undefined;
  if (isMe && !msg.text) {
    attachmentStatus = isPending ? "pending" : msg.status ?? "sent";
  }

  // Наведение считаем один раз на сообщение: подсветку получают и текст, и
  // вложения, и голосовое — иначе у одного сообщения разные части светятся
  // по-разному.
  const isHovered =
    hoveredMessageId === msg.id || activeActionMsgId === msg.id;

  const bubbleStyle = getMessageBubbleStyle({
    isMe,
    isDark,
    isHovered,
    isEffectivelyDeleted: false,
    isTargetHighlighted,
    currentMatchMsg,
    highlighted,
    hasThread: repliesCount > 0,
  });

  return (
    <motion.div
      key={msg.id}
      id={`chat-msg-${msg.id}`}
      data-msg-id={msg.id}
      ref={(el) => setMessageRef(msg.id, el)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className={`w-full flex items-end ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div className={`inline-flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {isMe && bubbleAvatars && (
          <img
            src={msg.senderAvatar || buildInitialsAvatar(msg.senderName || "Вы")}
            alt={msg.senderName || "Вы"}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                buildInitialsAvatar(msg.senderName || "Вы");
            }}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 2px var(--th-accent-border)",
            }}
          />
        )}
        {!isMe && bubbleAvatars && (
          <img
            src={msg.senderAvatar || activeContact.avatar}
            alt={msg.senderName || activeContact.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                buildInitialsAvatar(msg.senderName || activeContact.name);
            }}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 2px var(--th-accent-border)",
            }}
          />
        )}
        <div
          className={`chat-bubble-column flex flex-col max-w-[65vw] sm:max-w-[420px] ${isMe ? "items-end" : "items-start"} relative group`}
          onMouseEnter={() => setHoveredMessageId(msg.id)}
          onMouseLeave={() => setHoveredMessageId(null)}
        >
          {msg.scheduled && (
            <div
              className={`flex items-center gap-1 mb-1 text-[10px] font-medium ${isMe ? "self-end" : "self-start"} text-[rgb(var(--th-warning-rgb))]`}
            >
              <Clock3 className="w-3 h-3" />
              <span>
                {t.scheduled} · {msg.scheduledTime}
              </span>
            </div>
          )}
          {/* Цитата и метка пересылки стоят НАД пузырём, на фоне переписки, а не
              внутри него: цвета берём от поверхности, иначе у своих сообщений
              белый текст «на акценте» ложится на светлый фон. */}
          {msg.replyTo && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                console.log("[ChatMessageItem] Clicked replyTo quote box!", {
                  targetId: msg.replyTo?.id,
                  currentId: msg.id,
                  replyToObj: msg.replyTo,
                });
                if (msg.replyTo?.id) {
                  onJumpToMessage?.(msg.replyTo.id, msg.id);
                } else {
                  console.warn("[ChatMessageItem] msg.replyTo has no id!", msg.replyTo);
                }
              }}
              title="Перейти к исходному сообщению"
              className="flex items-center gap-2 mb-1 px-3 py-1.5 rounded-2xl text-xs max-w-full cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] bg-[var(--th-accent-soft)] border border-[var(--th-accent-border)]"
            >
              <div className="w-1 h-6 rounded-full flex-shrink-0 bg-[var(--th-accent-text)]" />
              <CornerUpLeft className="w-3 h-3 flex-shrink-0 text-[var(--th-accent-text)]" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[10px] text-[var(--th-accent-text)]">
                  {msg.replyTo.senderName}
                </span>
                <p className="truncate max-w-[200px] text-[var(--th-text-muted)]">
                  {msg.replyTo.text}
                </p>
              </div>
            </div>
          )}
          {msg.forwarded && (
            <div
              className={`flex items-center gap-1 mb-1 text-[10px] text-[var(--th-text-muted)] ${isMe ? "self-end" : "self-start"}`}
            >
              <Forward className="w-3 h-3" />
              <span>
                {msg.forwardedSenderName
                  ? `${t.forwardedFrom} ${msg.forwardedSenderName}`
                  : t.forwarded}
              </span>
            </div>
          )}
          <If is={!!(msg.senderName && !isMe && activeContact.isGroup)}>
            <span
              className="text-[10px] font-semibold mb-0.5 text-[var(--th-accent-text)]"
            >
              {msg.senderName}
            </span>
          </If>
          <AnimatePresence>
            {showReactionPicker && (
              <ReactionPicker
                msgId={msg.id}
                buttonRect={actionMenuRect}
                isMe={isMe}
                onSelect={(emoji) => {
                  handleReaction(msg.id, emoji);
                  setShowReactionPicker(false);
                }}
                onClose={() => setShowReactionPicker(false)}
                isDark={isDark}
              />
            )}
          </AnimatePresence>
          <div
            ref={bubbleRef}
            className={`relative max-w-full ${isMe ? "self-end" : "self-start"}`}
          >
            <AnimatePresence>
              {(hoveredMessageId === msg.id || activeActionMsgId === msg.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute top-1/2 -translate-y-1/2 ${isMe ? "-left-9" : "-right-9"} flex items-center z-30`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActionMenuRect(rect);
                      setActiveActionMsgId((prev) =>
                        prev === msg.id ? null : msg.id,
                      );
                    }}
                    aria-label="Действия"
                    className="w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
                    style={{
                      background: "var(--th-chip-bg)",
                      border: "1px solid var(--th-chip-border)",
                    }}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {activeActionMsgId === msg.id && (
                    <MessageActionMenu
                      buttonRect={actionMenuRect}
                      isMe={isMe}
                      isDark={isDark}
                      onReactionClick={() => {
                        setShowReactionPicker(true);
                        setActiveActionMsgId(null);
                      }}
                      onReply={() => {
                        const attachments = msg.attachments ?? (msg.attachment ? [msg.attachment] : []);
                        const firstAtt = attachments[0];
                        const icon = firstAtt
                          ? firstAtt.type === "image"
                            ? "📷 "
                            : firstAtt.type === "voice"
                              ? "🎤 "
                              : "📁 "
                          : "";
                        const replyText = firstAtt
                          ? msg.text
                            ? `${icon}${msg.text}`
                            : `${icon}${firstAtt.name || t.attachmentLabel || "Вложение"}`
                          : msg.text;

                        setReplyingTo({
                          id: msg.id,
                          senderName:
                            msg.senderName || (isMe ? t.you : activeContact.name),
                          text: replyText,
                        });
                        setActiveActionMsgId(null);
                      }}
                      onForward={() => {
                        setForwardingMsg(msg);
                        setActiveActionMsgId(null);
                      }}
                      onDelete={() => {
                        setDeletingMsgId(msg.id);
                        setActiveActionMsgId(null);
                      }}
                      onThread={() => {
                        setOpenThreadMsgId(msg.id);
                        setShowContactDrawer(false);
                        setActiveActionMsgId(null);
                      }}
                      onPin={() => {
                        handlePinMessage(msg.id);
                        setActiveActionMsgId(null);
                      }}
                      pinLabel={
                        msg.pinned
                          ? lang === "ru"
                            ? "Открепить"
                            : lang === "tg"
                              ? "Ҷудо кардан"
                              : "Unpin"
                          : lang === "ru"
                            ? "Закрепить"
                            : lang === "tg"
                              ? "Маҳкам кардан"
                              : "Pin"
                      }
                      onClose={() => setActiveActionMsgId(null)}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <MessageAttachments
              attachments={msg.attachments ?? (msg.attachment ? [msg.attachment] : [])}
              isMe={isMe}
              isDark={isDark}
              isHovered={isHovered}
              isTargetHighlighted={isTargetHighlighted}
              status={attachmentStatus}
              sendingLabel={t.sending}
            />
            {!!msg.text && (
              <div
                className={`chat-bubble px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words transition-all duration-300 ease-in-out cursor-default ${
                    isTargetHighlighted
                      ? `rounded-2xl ${isMe ? "rounded-br-md text-[var(--th-bubble-out-text)]" : "rounded-bl-md text-[var(--th-bubble-in-text)]"} ring-2 ring-[rgb(var(--th-accent-rgb))] scale-[1.02] shadow-[0_0_24px_rgb(var(--th-accent-2-rgb)/0.85)] animate-pulse`
                      : currentMatchMsg
                        ? "rounded-2xl ring-2 ring-[rgb(var(--th-warning-rgb))] text-[var(--th-text)]"
                        : highlighted
                          ? "rounded-2xl text-[var(--th-text)]"
                          : isMe
                            ? "rounded-2xl rounded-br-md text-[var(--th-bubble-out-text)]"
                            : "rounded-2xl rounded-bl-md text-[var(--th-bubble-in-text)]"
                  }`}
                style={bubbleStyle}
              >
                <If is={!!msg.pinned}>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold mb-1 mr-2 px-1.5 py-0.5 rounded-md ${
                      isMe
                        ? "bg-[rgb(var(--th-bubble-out-on-rgb)/0.2)] text-[var(--th-bubble-out-text)] border border-[rgb(var(--th-bubble-out-on-rgb)/0.3)]"
                        : "bg-[var(--th-accent-soft-strong)] text-[var(--th-accent-text)] border border-[var(--th-accent-border)]"
                    }`}
                  >
                    <Pin className="w-3 h-3 flex-shrink-0" />
                    <span>{t.pinned}</span>
                  </span>
                </If>
                <span>{msg.text}</span>
                <If is={messageMeta === "inside"}>
                  <MessageMeta
                    time={msg.time}
                    isMe={isMe}
                    isPending={isPending}
                    status={msg.status}
                    placement="inside"
                  />
                </If>
              </div>
            )}
            {!!msg.text && (
              <MessageLinkPreview text={msg.text} isMe={isMe} t={t} />
            )}
          </div>
          <If is={messageMeta === "below" && !!msg.text}>
            <MessageMeta
              time={msg.time}
              isMe={isMe}
              isPending={isPending}
              status={msg.status}
              placement="below"
            />
          </If>
          <If
            is={
              !!(
                (msg.reactions && msg.reactions.length > 0) ||
                (msg.threadCount && msg.threadCount > 0)
              )
            }
          >
            <div
              className={`flex flex-wrap gap-1.5 mt-1.5 ${
                isMe ? "self-end justify-end" : "self-start justify-start"
              }`}
              style={{
                maxWidth: bubbleWidth ? `${bubbleWidth}px` : "100%",
              }}
            >
              <If is={!!(msg.reactions && msg.reactions.length > 0)}>
                <>
                  {msg.reactions?.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => handleReaction(msg.id, r.emoji)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 select-none"
                      style={{
                        background: r.reactedByMe
                          ? "rgb(var(--th-accent-rgb) / 0.25)"
                          : "var(--th-chip-bg)",
                        border: r.reactedByMe
                          ? "1px solid rgb(var(--th-accent-rgb) / 0.5)"
                          : "1px solid var(--th-chip-border)",
                      }}
                    >
                      <span className="text-xs leading-none">{r.emoji}</span>
                      <span className="text-[10px] font-semibold text-[var(--th-text-muted)]">
                        {r.count}
                      </span>
                    </button>
                  ))}
                </>
              </If>
              <If is={repliesCount > 0}>
                <button
                  onClick={() => {
                    setOpenThreadMsgId(msg.id);
                    setShowContactDrawer(false);
                  }}
                  aria-label={
                    unreadReplies > 0
                      ? `${formatRepliesCount(repliesCount, lang)}, ${t.newReplies}: ${unreadReplies}`
                      : formatRepliesCount(repliesCount, lang)
                  }
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer text-[var(--th-accent-text)]"
                  style={{
                    background: "var(--th-accent-soft-strong)",
                    // Непрочитанный тред тянет взгляд контуром и тенью: цвет
                    // чипа остаётся прежним, меняется только его заметность.
                    border: unreadReplies
                      ? "1px solid rgb(var(--th-danger-rgb) / 0.65)"
                      : "1px solid var(--th-accent-border)",
                    boxShadow: unreadReplies
                      ? "0 2px 12px rgb(var(--th-danger-rgb) / 0.35)"
                      : "0 2px 10px rgb(var(--th-accent-rgb) / 0.2)",
                  }}
                >
                  <MessageSquare className="w-3 h-3 text-[var(--th-accent-text)]" />
                  <span>{formatRepliesCount(repliesCount, lang)}</span>
                  <If is={unreadReplies > 0}>
                    <span className="min-w-4 h-4 px-1 rounded-full bg-[rgb(var(--th-danger-rgb))] text-[var(--th-on-accent)] text-[9px] font-bold flex items-center justify-center">
                      +{unreadReplies}
                    </span>
                  </If>
                </button>
              </If>
            </div>
          </If>
        </div>
      </div>
    </motion.div>
  );
};
