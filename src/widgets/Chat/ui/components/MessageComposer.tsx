import React from "react";
import { AnimatePresence } from "framer-motion";
import { Smile, Paperclip, Clock3, Mic, Send, Upload } from "lucide-react";
import { If } from "@shared/ui";
import type { EmojiCategory } from "../../model";
import { Translations } from "../../lib/translations";
import { EmojiPicker } from "./EmojiPicker";
import { SchedulePicker } from "./SchedulePicker";
import { VoiceRecorder } from "./VoiceRecorder";
import { useAutoResizeTextarea } from "../../lib/useAutoResizeTextarea";
import { useComposerDropzone } from "../../lib/useComposerDropzone";

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
  /** Вложения из буфера обмена (Ctrl+V) и перетаскиванием — обработчик один. */
  onAttachFiles?: (files: File[]) => void;
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
  onAttachFiles,
}: IProps) => {
  const textareaRef = useAutoResizeTextarea(input, INPUT_MAX_ROWS);
  const { isDraggingOver, dropHandlers } = useComposerDropzone(onAttachFiles);

  return (
    <div
      className="px-6 py-4 border-t flex-shrink-0 border-[var(--th-divider)]"
      style={{
        background: "var(--th-composer-bg)",
        backdropFilter: "blur(16px)",
      }}
      {...dropHandlers}
    >
      <div
        className="relative flex items-center gap-2 rounded-3xl px-4 py-2"
        style={{
          background: "var(--th-input-bg)",
          border: "1px solid var(--th-input-border)",
        }}
      >
        {/* Подсказка перетаскивания перекрывает поле, но не события: без
            pointer-events-none указатель «уходит» с зоны и дроп не случается. */}
        <If is={isDraggingOver}>
          <div
            className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed text-sm font-semibold pointer-events-none border-[rgb(var(--th-accent-rgb)/0.7)] bg-[var(--th-accent-soft-strong)] text-[var(--th-accent-text)]"
          >
            <Upload className="w-4 h-4" />
            <span>{t.dropFiles}</span>
          </div>
        </If>
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg)] ${showEmojiPicker ? "text-[var(--th-accent-text)] bg-[var(--th-accent-soft)]" : "text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"}`}
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
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg)] text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"
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
                // Картинка из буфера приходит элементом kind: "file". Текст
                // рядом с ней не трогаем — вставку перехватываем только когда
                // файлы действительно есть.
                const files = Array.from(e.clipboardData.items || [])
                  .filter((item) => item.kind === "file")
                  .map((item) => item.getAsFile())
                  .filter((file): file is File => file !== null);

                if (files.length > 0 && onAttachFiles) {
                  e.preventDefault();
                  onAttachFiles(files);
                }
              }}
              className="flex-1 bg-transparent outline-none text-sm px-2 py-2 resize-none leading-relaxed text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
            />

            {/* Отложенная отправка сообщений (временное скрытие кнопкой часов):
            <div className="relative flex items-center">
              <button
                onClick={() => setShowSchedulePicker?.((v) => !v)}
                aria-label={t.scheduleMessage}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 hover:bg-[var(--th-hover-bg)] ${showSchedulePicker ? "text-[var(--th-accent-text)] bg-[var(--th-accent-soft)]" : "text-[var(--th-text-faint)] hover:text-[rgb(var(--th-warning-rgb))]"}`}
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
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg)] text-[var(--th-text-faint)] hover:text-[rgb(var(--th-danger-rgb))]"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={onSend}
              disabled={(!input.trim() && !hasPendingFiles) || !canSend}
              aria-label={t.newMessage}
              className="w-9 h-9 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-[var(--th-on-accent)] transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110 flex-shrink-0"
              style={{
                background: "var(--th-action-bg)",
                boxShadow: "var(--th-glow-accent)",
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
