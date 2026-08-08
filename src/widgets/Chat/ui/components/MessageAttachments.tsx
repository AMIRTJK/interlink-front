import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, ImageIcon, X } from "lucide-react";
import { toast } from "@shared/lib";
import type { MessageAttachment } from "../../model";
import { chatUrls, downloadPrivateFile } from "../../api";
import { getAttachmentIcon } from "../../lib/chatHelpers";
import { VoiceBubble } from "./VoiceBubble";

interface IProps {
  attachments: MessageAttachment[];
  isMe: boolean;
  isDark: boolean;
  isTargetHighlighted?: boolean;
}

// Вложения сообщения. Файлы приватные: превью картинок разрешено в blob-URL,
// просмотр полноразмерного фото в модалке по центру экрана через React Portal и скачивание с токеном.

export const MessageAttachments = ({
  attachments,
  isMe,
  isDark,
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
              isTargetHighlighted={isTargetHighlighted}
            />
          );
        }

        return (
          <div
            key={key}
            className={`mb-1.5 rounded-2xl overflow-hidden transition-all duration-200 ease-in-out hover:brightness-105 ${
              isMe ? "rounded-br-md" : "rounded-bl-md"
            } ${
              isTargetHighlighted
                ? "ring-2 ring-violet-500 scale-[1.02] shadow-[0_0_24px_rgba(168,85,247,0.85)] animate-pulse"
                : ""
            }`}
            style={{
              background: isTargetHighlighted
                ? "linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247), rgb(59, 130, 246))"
                : isMe
                  ? "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))"
                  : isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.95)",
              border: isTargetHighlighted
                ? "2px solid #ffffff"
                : isMe
                  ? "1px solid rgba(196,181,253,0.5)"
                  : isDark
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(124,58,237,0.2)",
              boxShadow: isTargetHighlighted
                ? "0 0 28px rgba(236, 72, 153, 0.9), 0 0 12px rgba(168, 85, 247, 0.8)"
                : isMe
                  ? "0 0 16px rgba(124, 58, 237, 0.5)"
                  : isDark
                    ? "0 2px 10px rgba(0,0,0,0.2)"
                    : "0 2px 10px rgba(124,58,237,0.08)",
            }}
          >
            {attachment.type === "image" && attachment.preview ? (
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
                <img
                  src={attachment.preview}
                  alt={attachment.name}
                  loading="lazy"
                  onClick={() => setSelectedImage(attachment)}
                  className="max-w-[260px] max-h-56 object-cover rounded-2xl transition-all duration-300 group-hover:scale-105"
                />
                <div
                  onClick={() => setSelectedImage(attachment)}
                  className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3.5 backdrop-blur-[2px] rounded-2xl"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(attachment);
                    }}
                    aria-label="Просмотреть изображение"
                    title="Просмотреть"
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
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
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
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
                      ? "bg-white/20 text-white"
                      : isDark
                        ? "bg-violet-500/25 text-violet-300"
                        : "bg-violet-100 text-violet-600 font-semibold"
                  }`}
                >
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isMe || isDark ? "text-white/95" : "text-gray-900"
                    }`}
                  >
                    {attachment.name}
                  </p>
                  <p
                    className={`text-[10px] ${
                      isMe || isDark ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {attachment.size}
                  </p>
                </div>
                <Download
                  className={`w-4 h-4 flex-shrink-0 ${
                    isMe || isDark ? "text-white/70" : "text-violet-600"
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
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-hidden"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 max-w-4xl mx-auto text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <ImageIcon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm font-semibold truncate">
                    {selectedImage.name}
                  </span>
                  {selectedImage.size && (
                    <span className="text-xs text-white/50 flex-shrink-0">
                      ({selectedImage.size})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all duration-150 hover:scale-105 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
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
