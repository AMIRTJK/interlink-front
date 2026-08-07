import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { If } from "@shared/ui";
import { Contact, Message } from "../../model";
import { useAutoResizeTextarea } from "../../lib/useAutoResizeTextarea";

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
      className={`w-72 flex-shrink-0 border-l flex flex-col overflow-hidden ${isDark ? "border-white/10" : "border-black/5"}`}
      style={{
        background: isDark ? "rgba(15,5,40,0.65)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <div className="flex items-center gap-2">
          <MessageSquare
            className={`w-4 h-4 ${isDark ? "text-violet-300" : "text-violet-500"}`}
          />
          <h3
            className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {threadLabel}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`px-4 py-3 border-b flex-shrink-0 ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/4"}`}
      >
        <div
          className={`border rounded-xl px-3 py-2.5 ${isDark ? "border-white/15 bg-white/8" : "border-black/5 bg-white/80"}`}
        >
          <p
            className={`text-[10px] mb-1 ${isDark ? "text-white/35" : "text-gray-400"}`}
          >
            {originalLabel}
          </p>
          <p
            className={`text-xs line-clamp-3 ${isDark ? "text-white/70" : "text-gray-700"}`}
          >
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
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          </div>
        </If>
        {threadMessages.map((tm) => {
          const isTMe = tm.senderId === "me";
          return (
            <div
              key={tm.id}
              className={`flex items-end gap-2 ${isTMe ? "justify-end" : "justify-start"}`}
            >
              {!isTMe && (
                <img
                  src={tm.senderAvatar || activeContact.avatar}
                  alt={tm.senderName || activeContact.name}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div
                className={`px-3 py-2 text-xs rounded-2xl max-w-[80%] whitespace-pre-wrap break-words transition-all duration-200 ease-in-out hover:brightness-110 ${isTMe ? "rounded-br-md text-white" : `rounded-bl-md ${isDark ? "text-white/80" : "text-gray-800"}`}`}
                style={{
                  background: isTMe
                    ? "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))"
                    : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.85)",
                  border: isTMe
                    ? "1px solid rgba(167,139,250,0.35)"
                    : isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: isTMe
                    ? "0 0 16px rgba(124, 58, 237, 0.5)"
                    : "none",
                }}
              >
                {tm.text}
              </div>
              {isTMe && tm.senderAvatar && (
                <img
                  src={tm.senderAvatar}
                  alt={tm.senderName || ""}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`px-4 py-3 border-t flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <div
          className={`flex items-end gap-2 px-3 py-2 rounded-xl ${isDark ? "bg-white/10 border border-white/15" : "bg-black/5 border border-black/5"}`}
        >
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
            className={`flex-1 bg-transparent outline-none text-xs resize-none leading-relaxed py-1 ${isDark ? "placeholder-white/30 text-white" : "placeholder-gray-400 text-gray-800"}`}
          />
          <button
            onClick={handleSendThread}
            disabled={!threadInput.trim()}
            className="w-7 h-7 rounded-full disabled:opacity-40 flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            }}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
