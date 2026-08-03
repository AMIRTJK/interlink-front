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
  type MediaItem,
} from "../../lib/chatMappers";
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
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
        </div>
      </If>

      <If is={!isLoading && items.length === 0}>
        <p
          className={`text-center text-xs py-6 ${isDark ? "text-white/40" : "text-gray-400"}`}
        >
          {t.noMessages}
        </p>
      </If>

      <If is={images.length > 0}>
        <p
          className={`text-[10px] uppercase tracking-wider mb-3 ${isDark ? "text-white/35" : "text-gray-400"}`}
        >
          {t.sharedMedia} · {images.length}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {images.map((item) => (
            <div
              key={item.id}
              className={`relative aspect-square rounded-xl overflow-hidden group border cursor-pointer ${isDark ? "bg-white/10 border-white/10 ring-1 ring-white/10" : "bg-black/5 border-black/5"}`}
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
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(item);
                  }}
                  title="Просмотреть"
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 shadow-md cursor-pointer"
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
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 shadow-md cursor-pointer"
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
          className={`mt-4 border-t pt-4 ${isDark ? "border-white/10" : "border-black/5"}`}
        >
          <p
            className={`text-[10px] uppercase tracking-wider mb-3 ${isDark ? "text-white/35" : "text-gray-400"}`}
          >
            {t.sharedFiles} · {files.length}
          </p>
          <div className="space-y-2">
            {files.map((item) => (
              <button
                key={item.id}
                onClick={() => handleDownload(item.id, item.name)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 text-left cursor-pointer ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/5 hover:bg-black/8"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-violet-500/20 text-violet-300" : "bg-violet-500/10 text-violet-600"}`}
                >
                  {getAttachmentIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${isDark ? "text-white/80" : "text-gray-800"}`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}
                  >
                    {item.size}
                  </p>
                </div>
                <Download className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-gray-500"}`} />
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
                    onClick={() => handleDownload(selectedImage.id, selectedImage.name)}
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
    </div>
  );
};
