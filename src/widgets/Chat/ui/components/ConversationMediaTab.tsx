import { useMemo } from "react";
import { Loader2 } from "lucide-react";
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
import { useAuthorizedMedia } from "../../lib/useAuthorizedMedia";
import { getAttachmentIcon } from "../../lib/chatHelpers";
import { Translations } from "../../lib/translations";

// Вкладка «Медиа» панели информации: вложения беседы из GET /conversations/{id}/media.
// Смонтирована только когда вкладка открыта — иначе запрос и загрузка превью
// уходили бы вместе с каждым открытием панели.

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
            <button
              key={item.id}
              onClick={() => handleDownload(item.id, item.name)}
              aria-label={item.name}
              className={`aspect-square rounded-xl overflow-hidden group border ${isDark ? "bg-white/10 border-white/10 ring-1 ring-white/10" : "bg-black/5 border-black/5"}`}
            >
              <If is={!!item.preview}>
                <img
                  src={item.preview}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                />
              </If>
            </button>
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
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 text-left ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/5 hover:bg-black/8"}`}
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
              </button>
            ))}
          </div>
        </div>
      </If>
    </div>
  );
};
