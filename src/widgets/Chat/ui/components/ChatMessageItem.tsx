import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, Clock3, CornerUpLeft, Forward, MoreHorizontal, Pin, MessageSquare, Smile } from "lucide-react";
import { Contact, Message, ReplyPreview } from "../../model";
import { Lang, Translations } from "../../lib/translations";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import { If } from "@shared/ui";
import { MessageAttachments } from "./MessageAttachments";
import { ReactionPicker } from "./ReactionPicker";
import { MessageActionMenu } from "./MessageActionMenu";

interface ChatMessageItemProps {
  msg: Message;
  isMe: boolean;
  activeContact: Contact;
  hoveredMessageId: string | null;
  activeActionMsgId: string | null;
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
  setMessageRef,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [actionMenuRect, setActionMenuRect] = useState<DOMRect | null>(null);
  const isEffectivelyDeleted = msg.deleted || msg.deletedForMe;

  const isTargetHighlighted =
    Boolean(targetHighlightedMessageId) &&
    String(targetHighlightedMessageId) === String(msg.id);

  const isPending = msg.status === "pending" || msg.id.startsWith("temp-");

  if (isPending) {
    return (
      <div
        key={msg.id}
        id={`chat-msg-${msg.id}`}
        data-msg-id={msg.id}
        ref={(el) => setMessageRef(msg.id, el)}
        className={`w-full flex items-center ${isMe ? "justify-end" : "justify-start"} py-1 px-2`}
      >
        <div className={`inline-flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {isMe && (
            <img
              src={msg.senderAvatar || buildInitialsAvatar(msg.senderName || "Вы")}
              alt={msg.senderName || "Вы"}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  buildInitialsAvatar(msg.senderName || "Вы");
              }}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 overflow-hidden"
              style={{
                boxShadow: "inset 0 0 0 2px rgba(167,139,250,0.45)",
              }}
            />
          )}
          <div className="flex items-center justify-center w-8 h-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="flex items-center justify-center"
            >
              <Clock3 className={`w-5 h-5 ${isDark ? "text-violet-300" : "text-violet-600"}`} />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
        {isMe && (
          <img
            src={msg.senderAvatar || buildInitialsAvatar(msg.senderName || "Вы")}
            alt={msg.senderName || "Вы"}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                buildInitialsAvatar(msg.senderName || "Вы");
            }}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 2px rgba(167,139,250,0.45)",
            }}
          />
        )}
        {!isMe && (
          <img
            src={msg.senderAvatar || activeContact.avatar}
            alt={msg.senderName || activeContact.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                buildInitialsAvatar(msg.senderName || activeContact.name);
            }}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end overflow-hidden"
            style={{
              boxShadow: "inset 0 0 0 2px rgba(167,139,250,0.45)",
            }}
          />
        )}
        <div
          className={`flex flex-col max-w-[65vw] sm:max-w-[420px] ${isMe ? "items-end" : "items-start"}`}
        >
          {msg.scheduled && !isEffectivelyDeleted && (
            <div
              className={`flex items-center gap-1 mb-1 text-[10px] font-medium ${isMe ? "self-end" : "self-start"} ${isDark ? "text-amber-400" : "text-amber-600"}`}
            >
              <Clock3 className="w-3 h-3" />
              <span>
                {t.scheduled} · {msg.scheduledTime}
              </span>
            </div>
          )}
          {msg.replyTo && !isEffectivelyDeleted && (
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
              className={`flex items-center gap-2 mb-1 px-3 py-1.5 rounded-2xl text-xs max-w-full cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] ${
                isMe
                  ? "bg-white/20 text-white border border-white/30"
                  : isDark
                    ? "bg-violet-500/20 border border-violet-400/20"
                    : "bg-violet-100/80 border border-violet-200"
              }`}
            >
              <div
                className={`w-1 h-6 rounded-full flex-shrink-0 ${
                  isDark ? "bg-violet-400" : "bg-violet-600"
                }`}
              />
              <CornerUpLeft className="w-3 h-3 text-violet-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span
                  className={`font-semibold text-[10px] ${
                    isDark ? "text-violet-300" : "text-violet-600"
                  }`}
                >
                  {msg.replyTo.senderName}
                </span>
                <p
                  className={`truncate max-w-[200px] ${
                    isDark ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  {msg.replyTo.text}
                </p>
              </div>
            </div>
          )}
          {msg.forwarded && !isEffectivelyDeleted && (
            <div
              className={`flex items-center gap-1 mb-1 text-[10px] ${isDark ? "text-white/40" : "text-gray-400"} ${isMe ? "self-end" : "self-start"}`}
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
              className={`text-[10px] font-semibold mb-0.5 ${isDark ? "text-violet-300" : "text-violet-600"}`}
            >
              {msg.senderName}
            </span>
          </If>
          {!isEffectivelyDeleted && (
            <MessageAttachments
              attachments={msg.attachments ?? (msg.attachment ? [msg.attachment] : [])}
              isMe={isMe}
              isDark={isDark}
            />
          )}
          {(msg.text || isEffectivelyDeleted) && (
            <div
              className="relative"
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <AnimatePresence>
                {showReactionPicker && !isEffectivelyDeleted && (
                  <ReactionPicker
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
              <AnimatePresence>
                {(hoveredMessageId === msg.id || activeActionMsgId === msg.id) && !isEffectivelyDeleted && (
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
                      className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/60 hover:bg-white/20" : "text-gray-500 hover:bg-black/8"}`}
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                        border: isDark
                          ? "1px solid rgba(255,255,255,0.15)"
                          : "1px solid rgba(0,0,0,0.08)",
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
                          setReplyingTo({
                            id: msg.id,
                            senderName:
                              msg.senderName || (isMe ? t.you : activeContact.name),
                            text: msg.text,
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
              <div
                className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words transition-all duration-300 ease-in-out cursor-default ${
                  isTargetHighlighted
                    ? "rounded-2xl ring-2 ring-violet-500 scale-[1.02] shadow-[0_0_24px_rgba(168,85,247,0.85)] animate-pulse"
                    : isEffectivelyDeleted
                      ? isDark
                        ? "italic text-white/30 rounded-2xl border border-dashed border-white/15 bg-white/4"
                        : "italic text-black/35 rounded-2xl border border-dashed border-black/10 bg-black/4"
                    : currentMatchMsg
                      ? "rounded-2xl ring-2 ring-amber-400 text-amber-100"
                      : highlighted
                        ? "rounded-2xl text-amber-200"
                        : msg.threadCount && msg.threadCount > 0
                          ? isMe
                            ? "rounded-2xl rounded-br-md text-white ring-1 ring-violet-300/40 shadow-[0_0_15px_rgba(167,139,250,0.35)]"
                            : `rounded-2xl rounded-bl-md ring-1 ring-violet-400/50 shadow-[0_0_15px_rgba(124,58,237,0.25)] ${isDark ? "text-white/95" : "text-violet-950 font-medium"}`
                          : isMe
                            ? "rounded-2xl rounded-br-md text-white"
                            : `rounded-2xl rounded-bl-md ${isDark ? "text-white/90" : "text-gray-800"}`
                }`}
                style={
                  isTargetHighlighted
                    ? {
                        background:
                          "linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247), rgb(59, 130, 246))",
                        border: "2px solid #ffffff",
                        boxShadow:
                          "0 0 28px rgba(236, 72, 153, 0.9), 0 0 12px rgba(168, 85, 247, 0.8)",
                        color: "#ffffff",
                      }
                    : isEffectivelyDeleted
                      ? {}
                    : currentMatchMsg
                      ? {
                          background: "rgba(251,191,36,0.25)",
                          border: "1px solid rgba(251,191,36,0.4)",
                        }
                      : highlighted
                        ? {
                            background: "rgba(251,191,36,0.15)",
                            border: "1px solid rgba(251,191,36,0.3)",
                          }
                        : msg.threadCount && msg.threadCount > 0
                          ? isMe
                            ? {
                                background:
                                  "linear-gradient(135deg,rgba(124,58,237,0.75),rgba(168,85,247,0.65),rgba(6,182,212,0.6))",
                                border: "1.5px solid rgba(196,181,253,0.65)",
                                boxShadow:
                                  "0 4px 20px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                                backgroundClip: "padding-box",
                              }
                            : {
                                background: "rgba(124,58,237,0.15)",
                                border: "1.5px solid rgba(167,139,250,0.4)",
                                boxShadow:
                                  "0 2px 12px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                                backgroundClip: "padding-box",
                              }
                          : isMe
                            ? {
                                background:
                                  "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
                                border: "1px solid rgba(167,139,250,0.4)",
                                boxShadow:
                                  "0 0 16px rgba(124, 58, 237, 0.5)",
                                backgroundClip: "padding-box",
                              }
                            : {
                                background: isDark
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(255,255,255,0.85)",
                                border: isDark
                                  ? "1px solid rgba(255,255,255,0.15)"
                                  : "1px solid rgba(0,0,0,0.08)",
                                boxShadow: isDark
                                  ? "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                                  : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                                backgroundClip: "padding-box",
                              }
                }
              >
                <If is={!!(msg.pinned && !isEffectivelyDeleted)}>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold mb-1 mr-2 px-1.5 py-0.5 rounded-md ${
                      isMe
                        ? "bg-white/20 text-white border border-white/30"
                        : isDark
                          ? "bg-violet-500/25 text-violet-300 border border-violet-400/30"
                          : "bg-violet-100 text-violet-700 border border-violet-300/60 font-bold"
                    }`}
                  >
                    <Pin className="w-3 h-3 flex-shrink-0" />
                    <span>{t.pinned}</span>
                  </span>
                </If>
                <span>{msg.text}</span>
                <span className="inline-flex items-center gap-1 float-right mt-1 ml-2.5 select-none text-[10px] opacity-75">
                  <span>{msg.time}</span>
                </span>
              </div>
            </div>
          )}
          <If
            is={
              ((msg.reactions && msg.reactions.length > 0) ||
                (msg.threadCount && msg.threadCount > 0)) &&
              !isEffectivelyDeleted
            }
          >
            <div
              className={`flex flex-wrap gap-1.5 mt-1 ${isMe ? "self-end justify-end" : "self-start justify-start"}`}
            >
              <If is={!!(msg.reactions && msg.reactions.length > 0)}>
                <>
                  {msg.reactions?.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => handleReaction(msg.id, r.emoji)}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all duration-200 ease-in-out hover:scale-110"
                      style={{
                        background: r.reactedByMe
                          ? "rgba(124,58,237,0.3)"
                          : isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.04)",
                        border: r.reactedByMe
                          ? "1px solid rgba(167,139,250,0.5)"
                          : isDark
                            ? "1px solid rgba(255,255,255,0.12)"
                            : "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <span>{r.emoji}</span>
                      <span
                        className={`text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-550"}`}
                      >
                        {r.count}
                      </span>
                    </button>
                  ))}
                </>
              </If>
              <If is={!!(msg.threadCount && msg.threadCount > 0)}>
                <button
                  onClick={() => {
                    setOpenThreadMsgId(msg.id);
                    setShowContactDrawer(false);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer ${isDark ? "text-violet-200" : "text-violet-750"}`}
                  style={{
                    background: isDark
                      ? "rgba(124,58,237,0.25)"
                      : "rgba(124,58,237,0.12)",
                    border: isDark
                      ? "1px solid rgba(167,139,250,0.4)"
                      : "1px solid rgba(124,58,237,0.25)",
                    boxShadow: isDark
                      ? "0 2px 10px rgba(124,58,237,0.25)"
                      : "0 2px 8px rgba(124,58,237,0.08)",
                  }}
                >
                  <MessageSquare
                    className={`w-3 h-3 ${isDark ? "text-violet-300" : "text-violet-600"}`}
                  />
                  <span>{formatRepliesCount(msg.threadCount || 0, lang)}</span>
                </button>
              </If>
            </div>
          </If>
        </div>
      </div>
    </motion.div>
  );
};
