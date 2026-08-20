import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Check, CheckCheck, Clock3 } from "lucide-react";
import { If } from "@shared/ui";
import { Contact, Message } from "../../model";
import { buildInitialsAvatar, formatChatDateDivider, getMessageDateKey } from "../../lib/chatFormat";
import { useAutoResizeTextarea } from "../../lib/useAutoResizeTextarea";
import { Lang, Translations } from "../../lib/translations";
import { ChatDateDivider } from "./ChatDateDivider";

const THREAD_INPUT_MAX_ROWS = 4;

interface ThreadPanelProps {
  parentMsg: Message;
  /** Ответы треда: GET /chat/messages/{id}/thread. */
  threadMessages: Message[];
  isLoading: boolean;
  activeContact: Contact;
  onClose: () => void;
  onSendThread: (msgId: string, text: string) => void;
  isDark: boolean;
  threadLabel: string;
  originalLabel: string;
  replyPlaceholder: string;
  lang?: Lang;
  t?: Translations;
}

export const ThreadPanel: React.FC<ThreadPanelProps> = ({
  parentMsg,
  threadMessages,
  isLoading,
  activeContact,
  onClose,
  onSendThread,
  isDark,
  threadLabel,
  originalLabel,
  replyPlaceholder,
  lang = "ru",
  t,
}) => {
  const [threadInput, setThreadInput] = useState("");
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const threadInputRef = useAutoResizeTextarea(
    threadInput,
    THREAD_INPUT_MAX_ROWS,
  );

  const handleSendThread = () => {
    if (!threadInput.trim()) return;
    onSendThread(parentMsg.id, threadInput.trim());
    setThreadInput("");
  };

  useEffect(() => {
    if (threadScrollRef.current)
      threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
  }, [threadMessages]);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="chat-side-panel w-72 flex-shrink-0 border-l flex flex-col overflow-hidden border-[var(--th-divider)]"
      style={{
        background: "var(--th-sidebar-bg)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 border-[var(--th-divider)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--th-accent-text)]" />
          <h3 className="font-semibold text-sm text-[var(--th-text)]">
            {threadLabel}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Закрыть тред"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b flex-shrink-0 border-[var(--th-divider)] bg-[var(--th-chip-bg)]">
        <div className="border rounded-xl px-3 py-2.5 border-[var(--th-panel-border)] bg-[var(--th-panel-bg)]">
          <p className="text-[10px] mb-1 text-[var(--th-text-faint)]">
            {originalLabel}
          </p>
          <p className="text-xs line-clamp-3 text-[var(--th-text-muted)]">
            {parentMsg.text}
          </p>
        </div>
      </div>

      <div
        ref={threadScrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        <If is={isLoading}>
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--th-accent-text)]" />
          </div>
        </If>
        {threadMessages.map((tm, index) => {
          const prevTm = index > 0 ? threadMessages[index - 1] : null;
          const currentDateKey = getMessageDateKey(tm.createdAt);
          const prevDateKey = prevTm ? getMessageDateKey(prevTm.createdAt) : null;
          const showDateDivider = Boolean(
            currentDateKey && (!prevDateKey || currentDateKey !== prevDateKey),
          );
          const isTMe = tm.senderId === "me";

          return (
            <React.Fragment key={tm.id}>
              {showDateDivider && (
                <ChatDateDivider
                  dateText={formatChatDateDivider(tm.createdAt, lang, t)}
                />
              )}
              <div
                className={`flex items-end gap-2 ${isTMe ? "justify-end" : "justify-start"}`}
              >
                {!isTMe && (
                  <img
                    src={tm.senderAvatar || activeContact.avatar || buildInitialsAvatar(tm.senderName || activeContact.name)}
                    alt={tm.senderName || activeContact.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        buildInitialsAvatar(tm.senderName || activeContact.name);
                    }}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 overflow-hidden"
                  />
                )}
                <div
                  className={`px-3 py-2 text-xs rounded-2xl max-w-[80%] whitespace-pre-wrap break-words transition-all duration-200 ease-in-out ${isTMe ? "rounded-br-md text-[var(--th-bubble-out-text)]" : "rounded-bl-md text-[var(--th-bubble-in-text)]"}`}
                  style={{
                    background: isTMe
                      ? "var(--th-bubble-out-bg)"
                      : "var(--th-bubble-in-bg)",
                    border: isTMe
                      ? "none"
                      : "1px solid var(--th-bubble-in-border)",
                    boxShadow: isTMe ? "var(--th-glow-accent)" : "none",
                  }}
                >
                  <span>{tm.text}</span>
                  <span className="inline-flex items-center gap-1 float-right mt-1 ml-2.5 select-none text-[10px] opacity-75">
                    {tm.time && <span>{tm.time}</span>}
                    {isTMe && !tm.deleted && (
                      <span className="inline-flex items-center ml-0.5" title={tm.status}>
                        {tm.status === "pending" || tm.id.startsWith("temp-") ? (
                          <Clock3 className="w-3 h-3 text-[var(--th-on-accent-muted)] animate-pulse" />
                        ) : tm.status === "read" || tm.status === "delivered" ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[var(--th-on-accent-muted)]" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-[var(--th-on-accent-muted)]" />
                        )}
                      </span>
                    )}
                  </span>
                </div>
                {isTMe && (
                  <img
                    src={tm.senderAvatar || buildInitialsAvatar(tm.senderName || "Вы")}
                    alt={tm.senderName || "Вы"}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        buildInitialsAvatar(tm.senderName || "Вы");
                    }}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 overflow-hidden"
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t flex-shrink-0 border-[var(--th-divider)]">
        <div className="flex items-end gap-2 px-3 py-2 rounded-xl bg-[var(--th-input-bg)] border border-[var(--th-input-border)]">
          <textarea
            ref={threadInputRef}
            rows={1}
            placeholder={replyPlaceholder}
            value={threadInput}
            onChange={(e) => setThreadInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter отправляет, Shift+Enter переносит строку.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendThread();
              }
            }}
            className="flex-1 bg-transparent outline-none text-xs resize-none leading-relaxed py-1 text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
          />
          <button
            onClick={handleSendThread}
            disabled={!threadInput.trim()}
            aria-label="Отправить ответ в тред"
            className="w-7 h-7 rounded-full disabled:opacity-40 flex items-center justify-center text-[var(--th-on-accent)] transition-all duration-200 ease-in-out hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))",
            }}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
