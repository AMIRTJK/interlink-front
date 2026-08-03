import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import { If } from "@shared/ui";
import type { Contact, Message, ReplyPreview } from "../../model";
import { Lang, Translations } from "../../lib/translations";
import { ChatMessageItem } from "./ChatMessageItem";

// Лента сообщений: загрузка, пустое состояние, догрузка старых при прокрутке
// вверх, индикатор набора и плавающая кнопка возврата к ответу.

interface IProps {
  messages: Message[];
  activeContact: Contact;
  isLoading: boolean;
  isError: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
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
  setMessageRef: (id: string, el: HTMLDivElement | null) => void;
}

const chatVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 32 }),
};

export const MessageList = ({
  messages,
  activeContact,
  isLoading,
  isError,
  hasOlder,
  isLoadingOlder,
  onScroll,
  scrollRef,
  typingNames,
  switchDirection,
  isDark,
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

  if (targetHighlightedMessageId || returnToMessageId) {
    console.log("[MessageList] Render with active reply state:", {
      targetHighlightedMessageId,
      returnToMessageId,
    });
  }

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: isDark ? "transparent" : "rgba(248,247,255,0.5)" }}
    >
      <motion.div
        ref={scrollRef}
        onScroll={onScroll}
        className="absolute inset-0 overflow-y-auto px-3 sm:px-6 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent hover:scrollbar-thumb-violet-500/40"
      >
        <AnimatePresence mode="wait" custom={switchDirection}>
          <motion.div
            key={activeContact.id}
            custom={switchDirection}
            variants={chatVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3.5 min-h-full flex flex-col justify-end"
          >
            <If is={hasOlder}>
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  disabled={isLoadingOlder}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all duration-150 border ${
                    isDark
                      ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      : "bg-black/5 border-black/10 text-black/60 hover:bg-black/10"
                  }`}
                >
                  {isLoadingOlder ? "Загрузка..." : "Загрузить ещё"}
                </button>
              </div>
            </If>

            <If is={isLoading}>
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <span
                  className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  {t.loadingChats || "Загрузка сообщений..."}
                </span>
              </div>
            </If>

            <If is={isError}>
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-sm font-medium text-rose-500">
                  Ошибка загрузки сообщений
                </p>
              </div>
            </If>

            <If is={isEmpty}>
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <MessageSquare
                  className={`w-10 h-10 ${isDark ? "text-white/20" : "text-gray-300"}`}
                />
                <p
                  className={`text-sm font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}
                >
                  {t.noMessages}
                </p>
                <p
                  className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
                >
                  {t.noMessagesHint}
                </p>
              </div>
            </If>

            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                isMe={msg.senderId === "me"}
                activeContact={activeContact}
                isDark={isDark}
                t={t}
                highlighted={itemProps.isHighlighted(msg.id)}
                currentMatchMsg={itemProps.isCurrentMatch(msg.id)}
                targetHighlightedMessageId={targetHighlightedMessageId}
                onJumpToMessage={onJumpToMessage}
                {...itemProps}
              />
            ))}

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
                    className="w-6 h-6 rounded-full object-cover border border-violet-400/30"
                  />
                  <div
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.85)",
                    }}
                  >
                    <span className="text-xs text-violet-300 mr-1 font-medium">
                      {typingNames.filter(Boolean).join(", ") || activeContact.name}{" "}
                      {t.typing}
                    </span>
                    <span className="flex items-center gap-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.span
                          key={delay}
                          className="w-1 h-1 rounded-full bg-violet-300"
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
            className="absolute bottom-6 right-8 z-30 flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-semibold text-xs shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/30"
            style={{
              background:
                "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
              boxShadow: "0 8px 25px rgba(124, 58, 237, 0.6)",
            }}
          >
            <ArrowDown className="w-4 h-4 animate-bounce text-white flex-shrink-0" />
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
            className="absolute bottom-6 right-8 z-30 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer border border-white/30"
            style={{
              background:
                "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
              boxShadow: "0 6px 22px rgba(124, 58, 237, 0.55)",
            }}
          >
            <ArrowDown className="w-5 h-5 text-white" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
