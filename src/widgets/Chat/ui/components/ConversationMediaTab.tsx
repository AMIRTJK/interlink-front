import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, ImageIcon, Loader2, X } from "lucide-react";
import { If } from "@shared/ui";
import { toast } from "@shared/lib";
import {
  chatUrls,
  downloadPrivateFile,
  useConversationMedia,
} from "../../api";
import {
  getAttachmentPreviewSource,
  mapMediaItem,
  type IChatLabels,
} from "../../lib/chatMappers";
import type { ChatMediaItem as MediaItem } from "../../model";
import { useAuthorizedMedia } from "../../lib/useAuthorizedMedia";
import { getAttachmentIcon } from "../../lib/chatHelpers";
import { Translations } from "../../lib/translations";

// Вкладка «Медиа» панели информации: вложения беседы из GET /conversations/{id}/media.
// Модалка полноэкранного просмотра рендерится через React Portal в document.body для точного центрирования по экрану.

interface IProps {
  conversationId: number | null;
  isDark: boolean;
  labels: IChatLabels;
  t: Translations;
}

export const ConversationMediaTab = ({
  conversationId,
  isDark,
  labels,
  t,
}: IProps) => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const { attachments, isLoading } = useConversationMedia(
    conversationId,
    null,
    true,
  );

  const media = useAuthorizedMedia(
    useMemo(
      () => attachments.map((attachment) => getAttachmentPreviewSource(attachment)),
      [attachments],
    ),
  );

  const items = useMemo(
    () =>
      attachments.map((attachment) =>
        mapMediaItem(attachment, { currentUserId: null, media, labels }),
      ),
    [attachments, media, labels],
  );

  const images = items.filter((item) => item.type === "image");
  const files = items.filter((item) => item.type !== "image");

  const handleDownload = async (id: number, name: string) => {
    try {
      await downloadPrivateFile(chatUrls.attachment(id), name);
    } catch {
      toast.error("Не удалось скачать файл");
    }
  };

  return (
    <div className="p-4">
      <If is={isLoading}>
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--th-accent-text)]" />
        </div>
      </If>

      <If is={!isLoading && items.length === 0}>
        <p
          className="text-center text-xs py-6 text-[var(--th-text-faint)]"
        >
          {t.noMessages}
        </p>
      </If>

      <If is={images.length > 0}>
        <p
          className="text-[10px] uppercase tracking-wider mb-3 text-[var(--th-text-faint)]"
        >
          {t.sharedMedia} · {images.length}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {images.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden group border cursor-pointer bg-[var(--th-chip-bg)] border-[var(--th-panel-border)]"
              onClick={() => setSelectedImage(item)}
            >
              <If is={!!item.preview}>
                <img
                  src={item.preview}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                />
              </If>
              <div className="absolute inset-0 bg-[var(--th-scrim)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(item);
                  }}
                  title="Просмотреть"
                  className="w-7 h-7 rounded-full bg-[rgb(var(--th-on-accent-rgb)/0.2)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.35)] text-[var(--th-on-accent)] flex items-center justify-center transition-all hover:scale-110 shadow-md cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.id, item.name);
                  }}
                  title="Скачать"
                  className="w-7 h-7 rounded-full bg-[rgb(var(--th-on-accent-rgb)/0.2)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.35)] text-[var(--th-on-accent)] flex items-center justify-center transition-all hover:scale-110 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </If>

      <If is={files.length > 0}>
        <div
          className="mt-4 border-t pt-4 border-[var(--th-divider)]"
        >
          <p
            className="text-[10px] uppercase tracking-wider mb-3 text-[var(--th-text-faint)]"
          >
            {t.sharedFiles} · {files.length}
          </p>
          <div className="space-y-2">
            {files.map((item) => (
              <button
                key={item.id}
                onClick={() => handleDownload(item.id, item.name)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 text-left cursor-pointer bg-[var(--th-chip-bg)] border-[var(--th-panel-border)] hover:bg-[var(--th-hover-bg)]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--th-accent-soft-strong)] text-[var(--th-accent-text)]"
                >
                  {getAttachmentIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate text-[var(--th-text)]"
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-[10px] text-[var(--th-text-faint)]"
                  >
                    {item.size}
                  </p>
                </div>
                <Download className="w-4 h-4 flex-shrink-0 text-[var(--th-text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      </If>

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
                  <ImageIcon className="w-4 h-4 text-[var(--th-accent-text)] flex-shrink-0" />
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
                    onClick={() => handleDownload(selectedImage.id, selectedImage.name)}
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
    </div>
  );
};
