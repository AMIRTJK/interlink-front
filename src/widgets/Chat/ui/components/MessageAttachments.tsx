import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, ImageIcon, X } from "lucide-react";
import { toast } from "@shared/lib";
import type { MessageAttachment } from "../../model";
import { chatUrls, downloadPrivateFile } from "../../api";
import {
  getAttachmentBubbleStyle,
  getAttachmentIcon,
} from "../../lib/chatHelpers";
import { VoiceBubble } from "./VoiceBubble";

interface IProps {
  attachments: MessageAttachment[];
  isMe: boolean;
  isDark: boolean;
  /** Наведение ловит вся группа сообщения — свечение общее для всех вложений. */
  isHovered?: boolean;
  isTargetHighlighted?: boolean;
}

// Вложения сообщения. Файлы приватные: превью картинок разрешено в blob-URL,
// просмотр полноразмерного фото в модалке по центру экрана через React Portal и скачивание с токеном.

export const MessageAttachments = ({
  attachments,
  isMe,
  isDark,
  isHovered = false,
  isTargetHighlighted,
}: IProps) => {
  const [selectedImage, setSelectedImage] = useState<MessageAttachment | null>(
    null,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  if (!attachments.length) return null;

  const handleDownload = async (attachment: MessageAttachment) => {
    if (attachment.attachmentId) {
      try {
        await downloadPrivateFile(
          chatUrls.attachment(attachment.attachmentId),
          attachment.name,
        );
      } catch {
        toast.error("Не удалось скачать файл");
      }
    } else if (attachment.preview) {
      const link = document.createElement("a");
      link.href = attachment.preview;
      link.download = attachment.name || "image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {attachments.map((attachment, index) => {
        const key = attachment.attachmentId ?? `${attachment.name}-${index}`;

        if (attachment.type === "voice") {
          return (
            <VoiceBubble
              key={key}
              duration={attachment.duration || 1}
              attachmentId={attachment.attachmentId}
              mimeType={attachment.mimeType}
              isMe={isMe}
              isDark={isDark}
              isHovered={isHovered}
              isTargetHighlighted={isTargetHighlighted}
            />
          );
        }

        const isImage = attachment.type === "image" && Boolean(attachment.preview);
        const cornerRadiusClass = `rounded-2xl ${isMe ? "rounded-br-md" : "rounded-bl-md"}`;

        return (
          <div
            key={key}
            className={`mb-1.5 overflow-hidden transition-all duration-200 ease-in-out ${cornerRadiusClass} ${
              isTargetHighlighted
                ? "ring-2 ring-[rgb(var(--th-accent-rgb))] scale-[1.02] shadow-[0_0_24px_rgb(var(--th-accent-2-rgb)/0.85)] animate-pulse"
                : ""
            }`}
            style={getAttachmentBubbleStyle({
              isImage,
              isMe,
              isDark,
              isHovered,
              isTargetHighlighted,
            })}
          >
            {isImage ? (
              <div className={`relative group cursor-pointer overflow-hidden isolate ${cornerRadiusClass}`}>
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  loading="lazy"
                  onClick={() => setSelectedImage(attachment)}
                  className={`block max-w-[260px] max-h-56 object-cover transition-all duration-300 group-hover:scale-105 ${cornerRadiusClass}`}
                />
                <div
                  onClick={() => setSelectedImage(attachment)}
                  className={`absolute inset-0 bg-[var(--th-scrim)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3.5 backdrop-blur-[2px] ${cornerRadiusClass}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(attachment);
                    }}
                    aria-label="Просмотреть изображение"
                    title="Просмотреть"
                    className="w-10 h-10 rounded-full bg-[rgb(var(--th-on-accent-rgb)/0.2)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.35)] text-[var(--th-on-accent)] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(attachment);
                    }}
                    aria-label="Скачать изображение"
                    title="Скачать"
                    className="w-10 h-10 rounded-full bg-[rgb(var(--th-on-accent-rgb)/0.2)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.35)] text-[var(--th-on-accent)] flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleDownload(attachment)}
                aria-label={`Скачать ${attachment.name}`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 min-w-[200px] text-left w-full cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isMe
                      ? "bg-[rgb(var(--th-on-accent-rgb)/0.2)] text-[var(--th-on-accent)]"
                      : "bg-[var(--th-accent-soft-strong)] text-[var(--th-accent-text)]"
                  }`}
                >
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isMe ? "text-[var(--th-on-accent)]" : "text-[var(--th-text)]"
                    }`}
                  >
                    {attachment.name}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isMe
                        ? "text-[var(--th-on-accent-muted)]"
                        : "text-[var(--th-text-muted)]"
                    }`}
                  >
                    {attachment.size}
                  </p>
                </div>
                <Download
                  className={`w-4 h-4 flex-shrink-0 ${
                    isMe
                      ? "text-[var(--th-on-accent-muted)]"
                      : "text-[var(--th-accent-text)]"
                  }`}
                />
              </button>
            )}
          </div>
        );
      })}

      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgb(var(--th-shadow-rgb)/0.85)] backdrop-blur-md p-4 overflow-hidden"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 px-5 py-3 rounded-2xl bg-[rgb(var(--th-on-accent-rgb)/0.1)] backdrop-blur-xl border border-[rgb(var(--th-on-accent-rgb)/0.15)] max-w-4xl mx-auto text-[var(--th-on-accent)] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <ImageIcon className="w-4 h-4 text-[rgb(var(--th-accent-2-rgb))] flex-shrink-0" />
                  <span className="text-sm font-semibold truncate">
                    {selectedImage.name}
                  </span>
                  {selectedImage.size && (
                    <span className="text-xs text-[var(--th-on-accent-faint)] flex-shrink-0">
                      ({selectedImage.size})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[rgb(var(--th-accent-rgb))] hover:bg-[rgb(var(--th-accent-2-rgb))] text-[var(--th-on-accent)] text-xs font-semibold transition-all duration-150 hover:scale-105 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 rounded-xl bg-[rgb(var(--th-on-accent-rgb)/0.1)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.2)] text-[var(--th-on-accent-muted)] hover:text-[var(--th-on-accent)] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={selectedImage.preview}
                alt={selectedImage.name}
                className="max-w-[92vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl mt-12 select-none"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
