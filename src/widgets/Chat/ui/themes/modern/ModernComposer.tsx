import React from "react";
import { AnimatePresence } from "framer-motion";
import { Mic, Paperclip, SendHorizontal, Smile, Upload } from "lucide-react";
import { If } from "@shared/ui";
import type { EmojiCategory } from "../../../model";
import type { Translations } from "../../../lib/translations";
import { useAutoResizeTextarea } from "../../../lib/useAutoResizeTextarea";
import { useComposerDropzone } from "../../../lib/useComposerDropzone";
import { EmojiPicker } from "../../components/EmojiPicker";
import { VoiceRecorder } from "../../components/VoiceRecorder";

// Поле ввода современного оформления. Логика та же, что и в классическом:
// те же хуки авторазмера и перетаскивания, тот же выбор эмодзи и та же запись
// голосового — отличаются только форма карточки и цвет круглых кнопок.

const INPUT_MAX_ROWS = 5;

interface IProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  hasPendingFiles: boolean;
  isDark: boolean;
  t: Translations;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  emojiCategories: EmojiCategory[];
  onEmojiSelect: (emoji: string) => void;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onSendVoice: (duration: number, audio: Blob) => void;
  onAttachFiles?: (files: File[]) => void;
}

export const ModernComposer = ({
  input,
  onInputChange,
  onSend,
  canSend,
  hasPendingFiles,
  isDark,
  t,
  fileInputRef,
  onFileChange,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiCategories,
  onEmojiSelect,
  isRecording,
  setIsRecording,
  onSendVoice,
  onAttachFiles,
}: IProps) => {
  const textareaRef = useAutoResizeTextarea(input, INPUT_MAX_ROWS);
  const { isDraggingOver, dropHandlers } = useComposerDropzone(onAttachFiles);
  const isSendDisabled = (!input.trim() && !hasPendingFiles) || !canSend;

  return (
    <div
      className="chat-modern-card relative flex items-end gap-2 px-3 py-2.5 flex-shrink-0"
      {...dropHandlers}
    >
      {/* Подсказка перетаскивания перекрывает поле, но не события: без
          pointer-events-none указатель «уходит» с зоны и дроп не случается. */}
      <If is={isDraggingOver}>
        <div
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 border-2 border-dashed text-sm font-semibold pointer-events-none text-[var(--th-accent-text)]"
          style={{
            borderRadius: "var(--chat-modern-radius)",
            borderColor: "var(--chat-modern-indigo)",
            background: "var(--chat-modern-soft)",
          }}
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
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t.files}
            title={t.files}
            className="chat-modern-action w-9 h-9"
            style={{
              background: "var(--chat-modern-soft)",
              color: "var(--th-text-muted)",
            }}
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />

          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              aria-label={t.smileys}
              aria-pressed={showEmojiPicker}
              title={t.smileys}
              className="chat-modern-action w-9 h-9"
              style={{ background: "var(--chat-modern-yellow)" }}
            >
              <Smile className="w-4.5 h-4.5" />
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
              // Картинка из буфера приходит элементом kind: "file". Текст рядом
              // с ней не трогаем — вставку перехватываем только когда файлы есть.
              const files = Array.from(e.clipboardData.items || [])
                .filter((item) => item.kind === "file")
                .map((item) => item.getAsFile())
                .filter((file): file is File => file !== null);

              if (files.length > 0 && onAttachFiles) {
                e.preventDefault();
                onAttachFiles(files);
              }
            }}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm px-2 py-2 resize-none leading-relaxed text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
          />

          <button
            type="button"
            onClick={() => setIsRecording(true)}
            aria-label={t.recordVoice}
            title={t.recordVoice}
            className="chat-modern-action w-9 h-9"
            style={{ background: "var(--chat-modern-red)" }}
          >
            <Mic className="w-4.5 h-4.5" />
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={isSendDisabled}
            aria-label={t.newMessage}
            title={t.newMessage}
            className="chat-modern-action w-9 h-9"
            style={{ background: "var(--chat-modern-blue)" }}
          >
            <SendHorizontal className="w-4.5 h-4.5" />
          </button>
        </>
      )}
    </div>
  );
};
