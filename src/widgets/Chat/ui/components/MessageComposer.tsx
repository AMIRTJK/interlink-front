import React from "react";
import { AnimatePresence } from "framer-motion";
import { Smile, Paperclip, Clock3, Mic, Send } from "lucide-react";
import type { EmojiCategory } from "../../model";
import { Translations } from "../../lib/translations";
import { EmojiPicker } from "./EmojiPicker";
import { SchedulePicker } from "./SchedulePicker";
import { VoiceRecorder } from "./VoiceRecorder";
import { useAutoResizeTextarea } from "../../lib/useAutoResizeTextarea";

const INPUT_MAX_ROWS = 5;

// Панель ввода: текст, эмодзи, вложения, отложенная отправка и голосовое.
// Без права chat.send поле не показывается — отправлять всё равно нечем.

interface IProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  isSending: boolean;
  hasPendingFiles: boolean;
  isDark: boolean;
  t: Translations;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  emojiCategories: EmojiCategory[];
  onEmojiSelect: (emoji: string) => void;
  showSchedulePicker?: boolean;
  setShowSchedulePicker?: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleOptions?: { label: string; offset: number }[];
  onSchedule?: (label: string, offset: number) => void;
  showAIPanel: boolean;
  setShowAIPanel: React.Dispatch<React.SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onSendVoice: (duration: number, audio: Blob) => void;
  onPasteFiles?: (files: File[]) => void;
}

export const MessageComposer = ({
  input,
  onInputChange,
  onSend,
  canSend,
  // isSending,
  hasPendingFiles,
  isDark,
  t,
  fileInputRef,
  onFileChange,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiCategories,
  onEmojiSelect,
  // showSchedulePicker,
  // setShowSchedulePicker,
  // scheduleOptions,
  // onSchedule,
  showAIPanel,
  setShowAIPanel,
  isRecording,
  setIsRecording,
  onSendVoice,
  onPasteFiles,
}: IProps) => {
  const textareaRef = useAutoResizeTextarea(input, INPUT_MAX_ROWS);

  return (
    <div
      className={`px-6 py-4 border-t flex-shrink-0 ${isDark ? "border-white/8" : "border-black/5"}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.4)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="relative flex items-center gap-2 rounded-3xl px-4 py-2"
        style={{
          background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.95)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(167,139,250,0.25)",
        }}
      >
        {isRecording ? (
          <VoiceRecorder
            onSend={onSendVoice}
            onCancel={() => setIsRecording(false)}
            isDark={isDark}
          />
        ) : (
          <div className="flex items-end gap-2 w-full">
            <div className="relative flex items-center">
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                aria-label={t.smileys}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showEmojiPicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-650"}`}
              >
                <Smile className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <EmojiPicker
                    categories={emojiCategories}
                    onSelect={onEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                    isDark={isDark}
                  />
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label={t.files}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-white/70" : "hover:bg-black/5 text-gray-400 hover:text-gray-650"}`}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
            />

            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={t.typeMessage}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                // Enter отправляет, Shift+Enter переносит строку.
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              onPaste={(e) => {
                const items = Array.from(e.clipboardData.items || []);
                const files: File[] = [];
                items.forEach((item) => {
                  if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                  }
                });
                if (files.length > 0 && onPasteFiles) {
                  e.preventDefault();
                  onPasteFiles(files);
                }
              }}
              className={`flex-1 bg-transparent outline-none text-sm px-2 py-2 resize-none leading-relaxed ${isDark ? "placeholder-white/25 text-white" : "placeholder-gray-400 text-gray-800"}`}
            />

            {/* Отложенная отправка сообщений (временное скрытие кнопкой часов):
            <div className="relative flex items-center">
              <button
                onClick={() => setShowSchedulePicker?.((v) => !v)}
                aria-label={t.scheduleMessage}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showSchedulePicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-amber-400" : "text-gray-400 hover:text-amber-600"}`}
              >
                <Clock3 className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showSchedulePicker && scheduleOptions && onSchedule && setShowSchedulePicker && (
                  <SchedulePicker
                    options={scheduleOptions}
                    title={t.scheduleMessage}
                    onSchedule={onSchedule}
                    onClose={() => setShowSchedulePicker(false)}
                    isDark={isDark}
                  />
                )}
              </AnimatePresence>
            </div>
            */}

            <button
              onClick={() => setIsRecording(true)}
              aria-label={t.recordVoice}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-red-400" : "hover:bg-black/5 text-gray-400 hover:text-red-550"}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={onSend}
              disabled={(!input.trim() && !hasPendingFiles) || !canSend}
              aria-label={t.newMessage}
              className="w-9 h-9 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)",
                boxShadow: "0 0 16px rgba(124,58,237,0.5)",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
