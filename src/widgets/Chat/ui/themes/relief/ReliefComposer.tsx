import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send, Smile, Upload } from "lucide-react";
import { If } from "@shared/ui";
import type { EmojiCategory } from "../../../model";
import type { Translations } from "../../../lib/translations";
import { useAutoResizeTextarea } from "../../../lib/useAutoResizeTextarea";
import { useComposerDropzone } from "../../../lib/useComposerDropzone";
import { EmojiPicker } from "../../components/EmojiPicker";
import { VoiceRecorder } from "../../components/VoiceRecorder";
import { ReliefActionButton } from "./ReliefActionButton";
import { SEND_BOUNCE_MS } from "./model";

// Поле ввода объёмного оформления. Логика та же, что и в остальных: те же хуки
// авторазмера и перетаскивания, тот же выбор эмодзи и та же запись голосового —
// отличаются только форма строки и объёмные цветные кнопки по краям.

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

export const ReliefComposer = ({
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

  // Отскок кнопки отправки из макета. Класс снимаем по таймеру: анимация
  // одноразовая, и без снятия повторное нажатие её уже не проиграет.
  const [isSending, setIsSending] = useState(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    },
    [],
  );

  const handleSend = useCallback(() => {
    if (isSendDisabled) return;
    setIsSending(true);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    bounceTimerRef.current = setTimeout(() => setIsSending(false), SEND_BOUNCE_MS);
    onSend();
  }, [isSendDisabled, onSend]);

  return (
    <div
      className="chat-relief-panel relative flex flex-col gap-3 px-6 py-4 flex-shrink-0"
      {...dropHandlers}
    >
      {/* Подсказка перетаскивания перекрывает поле, но не события: без
          pointer-events-none указатель «уходит» с зоны и дроп не случается. */}
      <If is={isDraggingOver}>
        <div
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 border-2 border-dashed text-sm font-semibold pointer-events-none text-[var(--th-text)]"
          style={{
            borderRadius: "var(--chat-relief-radius)",
            borderColor: "rgb(var(--chat-relief-indigo))",
            background: "var(--chat-relief-composer-well)",
          }}
        >
          <Upload className="w-4 h-4" />
          <span>{t.dropFiles}</span>
        </div>
      </If>

      {/* Светящаяся полоса над строкой ввода — акцент макета. */}
      <span
        aria-hidden="true"
        className="h-0.5 rounded-sm flex-shrink-0"
        style={{ background: "var(--chat-relief-composer-line)" }}
      />

      {isRecording ? (
        <VoiceRecorder
          onSend={onSendVoice}
          onCancel={() => setIsRecording(false)}
          isDark={isDark}
        />
      ) : (
        <div
          className="flex items-center gap-4 min-h-[52px] px-4 py-2 rounded-[26px]"
          style={{ background: "var(--chat-relief-composer-well)" }}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <ReliefActionButton
              Icon={Paperclip}
              label={t.files}
              tone="grey"
              size={36}
              iconSize={20}
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
            />

            <div className="relative flex items-center">
              <ReliefActionButton
                Icon={Smile}
                label={t.smileys}
                tone="amber"
                size={36}
                iconSize={20}
                isActive={showEmojiPicker}
                onClick={() => setShowEmojiPicker((v) => !v)}
              />
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
                handleSend();
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
            className="flex-1 min-w-0 bg-transparent outline-none text-sm leading-[18px] py-1.5 resize-none text-[var(--th-text)] placeholder:text-[var(--th-text-muted)]"
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <ReliefActionButton
              Icon={Mic}
              label={t.recordVoice}
              tone="red"
              size={36}
              iconSize={20}
              onClick={() => setIsRecording(true)}
            />
            <ReliefActionButton
              Icon={Send}
              label={t.newMessage}
              tone="blue"
              size={36}
              iconSize={16}
              disabled={isSendDisabled}
              onClick={handleSend}
              className={isSending ? "chat-relief-action--sending" : ""}
            />
          </div>
        </div>
      )}
    </div>
  );
};
