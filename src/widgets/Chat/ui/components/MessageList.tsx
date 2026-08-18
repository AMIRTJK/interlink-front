import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { If } from "@shared/ui";
import type { Contact, Message, ReplyPreview } from "../../model";
import { Lang, Translations } from "../../lib/translations";
import { formatChatDateDivider, getMessageDateKey } from "../../lib/chatFormat";
import { useFloatingChatDate } from "../../lib/useFloatingChatDate";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatDateDivider } from "./ChatDateDivider";
import { ChatFloatingDate } from "./ChatFloatingDate";

// Лента сообщений: загрузка, пустое состояние, догрузка старых при прокрутке
// вверх, индикатор набора и плавающая кнопка возврата к ответу.

interface IProps {
  currentUserId?: number | string | null;
  messages: Message[];
  activeContact: Contact;
  isLoading: boolean;
  isError: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder?: () => void;
  onScroll: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  typingNames: string[];
  switchDirection: number;
  hoveredMessageId: string | null;
  activeActionMsgId: string | null;
  isDark: boolean;
  lang: Lang;
  t: Translations;
  targetHighlightedMessageId?: string | null;
  returnToMessageId?: string | null;
  showScrollBottom?: boolean;
  onScrollToBottom?: () => void;
  onJumpToMessage?: (targetId: string, returnFromId?: string) => void;
  onReturnToMessage?: () => void;
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
  /** Сколько ответов треда человек ещё не видел. */
  getUnreadThreadCount: (msgId: string, repliesCount: number) => number;
  setMessageRef: (id: string, el: HTMLDivElement | null) => void;
}

const chatVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const MessageList = ({
  currentUserId,
  messages,
  activeContact,
  isLoading,
  isError,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onScroll,
  scrollRef,
  typingNames,
  switchDirection,
  isDark,
  lang,
  t,
  targetHighlightedMessageId,
  returnToMessageId,
  showScrollBottom,
  onScrollToBottom,
  onJumpToMessage,
  onReturnToMessage,
  ...itemProps
}: IProps) => {
  const isEmpty = !isLoading && !isError && messages.length === 0;

  const {
    isVisible: isFloatingDateVisible,
    floatingDate,
    handleScroll: handleFloatingDateScroll,
  } = useFloatingChatDate({
    scrollRef,
    activeConversationId: activeContact.id,
  });

  const handleContainerScroll = React.useCallback(() => {
    onScroll();
    handleFloatingDateScroll();
  }, [onScroll, handleFloatingDateScroll]);

  if (targetHighlightedMessageId || returnToMessageId) {
    console.log("[MessageList] Render with active reply state:", {
      targetHighlightedMessageId,
      returnToMessageId,
    });
  }

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--th-chat-canvas)" }}
    >
      <ChatFloatingDate
        isVisible={isFloatingDateVisible}
        dateText={floatingDate}
      />
      {/* Вертикальные отступы держат ореол наведения: это box-shadow, он не
          увеличивает ни размер элемента, ни прокручиваемую область, поэтому у
          крайних сообщений его срезал край скролл-контейнера. 32px перекрывают
          вылет самой широкой тени (blur 52px ≈ 26px наружу). По горизонтали
          запас дают колонка аватара и отступы, обрезку по X держит этот
          контейнер — вложенным элементам её ставить нельзя (см. ниже). */}
      <motion.div
        ref={scrollRef}
        onScroll={handleContainerScroll}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-8 space-y-3.5"
        style={{ overflowX: "hidden" }}
      >
        <AnimatePresence mode="wait" custom={switchDirection}>
          {/* Колонке сообщений overflow ставить нельзя: `overflow-x: hidden` по
              спецификации переводит вторую ось из visible в auto, колонка
              становится своим скролл-портом и режет тени детей ровно по нижнему
              сообщению — свечение обрывалось даже при запасе у скролл-контейнера.
              Горизонтальный вылет гасит родитель. */}
          <motion.div
            key={activeContact.id}
            custom={switchDirection}
            variants={chatVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3.5 min-h-full flex flex-col justify-start"
          >
            <div className="mt-auto" />
            <If is={hasOlder}>
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  disabled={isLoadingOlder}
                  onClick={onLoadOlder}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 border bg-[var(--th-chip-bg)] border-[var(--th-chip-border)] text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"
                >
                  {isLoadingOlder ? "Загрузка..." : "Загрузить ещё"}
                </button>
              </div>
            </If>

            <If is={isLoading}>
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[rgb(var(--th-accent-rgb))] border-t-transparent animate-spin" />
                <span className="text-xs text-[var(--th-text-faint)]">
                  {t.loadingChats || "Загрузка сообщений..."}
                </span>
              </div>
            </If>

            <If is={isError}>
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <AlertCircle className="w-8 h-8 text-[rgb(var(--th-danger-rgb))]" />
                <p className="text-sm font-medium text-[rgb(var(--th-danger-rgb))]">
                  Ошибка загрузки сообщений
                </p>
              </div>
            </If>

            <If is={isEmpty}>
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <MessageSquare className="w-10 h-10 text-[var(--th-text-faint)] opacity-60" />
                <p className="text-sm font-medium text-[var(--th-text-muted)]">
                  {t.noMessages}
                </p>
                <p className="text-xs text-[var(--th-text-faint)]">
                  {t.noMessagesHint}
                </p>
              </div>
            </If>

            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const currentDateKey = getMessageDateKey(msg.createdAt);
              const prevDateKey = prevMsg ? getMessageDateKey(prevMsg.createdAt) : null;
              const showDateDivider = Boolean(
                currentDateKey && (!prevDateKey || currentDateKey !== prevDateKey),
              );

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <ChatDateDivider
                      dateText={formatChatDateDivider(msg.createdAt, lang, t)}
                    />
                  )}
                  <ChatMessageItem
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
                </React.Fragment>
              );
            })}

            <AnimatePresence>
              {typingNames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <img
                    src={activeContact.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover overflow-hidden"
                    style={{ boxShadow: "inset 0 0 0 1.5px var(--th-accent-border)" }}
                  />
                  <div
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md"
                    style={{ background: "var(--th-bubble-in-bg)" }}
                  >
                    <span className="text-xs text-[var(--th-accent-text)] mr-1 font-medium">
                      {typingNames.filter(Boolean).join(", ") || activeContact.name}{" "}
                      {t.typing}
                    </span>
                    <span className="flex items-center gap-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.span
                          key={delay}
                          className="w-1 h-1 rounded-full bg-[var(--th-accent-text)]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay }}
                        />
                      ))}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {returnToMessageId ? (
          <motion.button
            key="return-to-msg"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onReturnToMessage}
            aria-label="Вернуться к сообщению с ответом"
            title="Вернуться к сообщению с ответом"
            className="absolute bottom-6 right-8 z-30 flex items-center gap-2.5 px-5 py-3 rounded-full text-[var(--th-on-accent)] font-semibold text-xs shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-[rgb(var(--th-on-accent-rgb)/0.3)]"
            style={{
              background: "var(--th-bubble-out-bg)",
              boxShadow: "0 8px 25px rgb(var(--th-accent-rgb) / 0.6)",
            }}
          >
            <ArrowDown className="w-4 h-4 animate-bounce text-[var(--th-on-accent)] flex-shrink-0" />
            <span>К своему сообщению</span>
          </motion.button>
        ) : showScrollBottom ? (
          <motion.button
            key="scroll-bottom"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onScrollToBottom}
            aria-label="Прокрутить в самый низ"
            title="Прокрутить в самый низ"
            className="absolute bottom-6 right-8 z-30 w-11 h-11 rounded-full flex items-center justify-center text-[var(--th-on-accent)] shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-[rgb(var(--th-on-accent-rgb)/0.3)]"
            style={{
              background: "var(--th-bubble-out-bg)",
              boxShadow: "0 6px 22px rgb(var(--th-accent-rgb) / 0.55)",
            }}
          >
            <ArrowDown className="w-5 h-5 text-[var(--th-on-accent)]" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
