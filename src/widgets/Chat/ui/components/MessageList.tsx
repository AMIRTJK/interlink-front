import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
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
      <AnimatePresence mode="wait" custom={switchDirection}>
        <motion.div
          key={activeContact.id}
          custom={switchDirection}
          variants={chatVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          ref={scrollRef}
          onScroll={onScroll}
          className="absolute inset-0 overflow-y-auto px-6 pt-14 pb-6 space-y-5"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: isDark
              ? "rgba(167,139,250,0.3) transparent"
              : "rgba(167,139,250,0.25) transparent",
            overflowX: "clip",
          }}
        >
          <If is={hasOlder || isLoadingOlder}>
            <div
              className={`flex items-center justify-center gap-2 text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}
            >
              <If is={isLoadingOlder}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </If>
              <span>{t.loadMore}</span>
            </div>
          </If>

          <If is={isLoading}>
            <div className="flex items-center justify-center h-full">
              <Loader2
                className={`w-6 h-6 animate-spin ${isDark ? "text-violet-300" : "text-violet-500"}`}
              />
            </div>
          </If>

          <If is={isError}>
            <p
              className={`text-center text-xs ${isDark ? "text-red-300" : "text-red-500"}`}
            >
              {t.noMessages}
            </p>
          </If>

          <If is={isEmpty}>
            <div className="flex flex-col items-center justify-center h-full gap-1 text-center">
              <p
                className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}
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
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-2 justify-start"
              >
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-violet-300/40"
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

      <AnimatePresence>
        {returnToMessageId && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onReturnToMessage}
            aria-label="Вернуться к сообщению с ответом"
            title="Вернуться к сообщению с ответом"
            className="absolute bottom-6 right-8 z-30 flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-semibold text-xs shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white/30"
            style={{
              background: "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
              boxShadow: "0 8px 25px rgba(124, 58, 237, 0.6)",
            }}
          >
            <ArrowDown className="w-4 h-4 animate-bounce text-white flex-shrink-0" />
            <span>К своему сообщению</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
