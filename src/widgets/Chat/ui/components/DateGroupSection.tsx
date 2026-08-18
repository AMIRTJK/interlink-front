import React, { useEffect, useRef, useState } from "react";
import type { Contact, Message, ReplyPreview } from "../../model";
import { Lang, Translations } from "../../lib/translations";
import { ChatDateDivider } from "./ChatDateDivider";
import { ChatMessageItem } from "./ChatMessageItem";

export interface IDateGroup {
  dateKey: string;
  dateText: string;
  messages: Message[];
}

interface IProps {
  group: IDateGroup;
  isScrolling: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  currentUserId?: number | string | null;
  activeContact: Contact;
  isDark: boolean;
  lang: Lang;
  t: Translations;
  targetHighlightedMessageId?: string | null;
  onJumpToMessage?: (targetId: string, returnFromId?: string) => void;
  isHighlighted: (msgId: string) => boolean;
  isCurrentMatch: (msgId: string) => boolean;
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
  getUnreadThreadCount: (msgId: string, repliesCount: number) => number;
  setMessageRef: (id: string, el: HTMLDivElement | null) => void;
}

/**
 * Секция сообщений за один день.
 * Содержит sticky-разделитель даты и отслеживает состояние фиксации (isStuck)
 * через IntersectionObserver для бесшовного поведения в стиле Telegram.
 */
export const DateGroupSection: React.FC<IProps> = React.memo(
  ({
    group,
    isScrolling,
    scrollRef,
    currentUserId,
    activeContact,
    isDark,
    lang,
    t,
    targetHighlightedMessageId,
    onJumpToMessage,
    ...itemProps
  }) => {
    const [isStuck, setIsStuck] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const sentinel = sentinelRef.current;
      const root = scrollRef.current;
      if (!sentinel || !root) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          // Если маркер ушёл выше верхней границы видимой области с учётом sticky-отступа
          const isAboveTop =
            !entry.isIntersecting &&
            entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
          setIsStuck(isAboveTop);
        },
        {
          root,
          rootMargin: "-14px 0px 0px 0px",
          threshold: 0,
        },
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [scrollRef]);

    return (
      <div
        data-date-group={group.dateKey}
        className="relative chat-date-group space-y-3.5"
      >
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 -z-10"
        />

        <ChatDateDivider
          dateText={group.dateText}
          isStuck={isStuck}
          isScrolling={isScrolling}
        />

        {group.messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            msg={msg}
            isMe={
              msg.senderId === "me" ||
              (currentUserId != null &&
                String(msg.senderId) === String(currentUserId))
            }
            activeContact={activeContact}
            isDark={isDark}
            lang={lang}
            t={t}
            highlighted={itemProps.isHighlighted(msg.id)}
            currentMatchMsg={itemProps.isCurrentMatch(msg.id)}
            targetHighlightedMessageId={targetHighlightedMessageId}
            onJumpToMessage={onJumpToMessage}
            {...itemProps}
          />
        ))}
      </div>
    );
  },
);

DateGroupSection.displayName = "DateGroupSection";
