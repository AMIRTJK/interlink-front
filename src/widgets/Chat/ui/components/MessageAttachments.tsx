import { Download } from "lucide-react";
import { toast } from "@shared/lib";
import type { MessageAttachment } from "../../model";
import { chatUrls, downloadPrivateFile } from "../../api";
import { getAttachmentIcon } from "../../lib/chatHelpers";
import { VoiceBubble } from "./VoiceBubble";

interface IProps {
  attachments: MessageAttachment[];
  isMe: boolean;
  isDark: boolean;
}

// Вложения сообщения. Файлы приватные: превью картинок уже разрешено в blob-URL
// маппером, а всё остальное скачивается запросом с токеном по клику.

export const MessageAttachments = ({ attachments, isMe, isDark }: IProps) => {
  if (!attachments.length) return null;

  const handleDownload = async (attachment: MessageAttachment) => {
    if (!attachment.attachmentId) return;
    try {
      await downloadPrivateFile(
        chatUrls.attachment(attachment.attachmentId),
        attachment.name,
      );
    } catch {
      toast.error("Не удалось скачать файл");
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
              isMe={isMe}
              isDark={isDark}
            />
          );
        }

        return (
          <div
            key={key}
            className={`mb-1.5 rounded-2xl overflow-hidden transition-all duration-200 ease-in-out hover:brightness-105 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
            style={{
              background: isMe
                ? "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))"
                : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.95)",
              border: isMe
                ? "1px solid rgba(196,181,253,0.5)"
                : isDark
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(124,58,237,0.2)",
              boxShadow: isMe
                ? "0 0 16px rgba(124, 58, 237, 0.5)"
                : isDark
                  ? "0 2px 10px rgba(0,0,0,0.2)"
                  : "0 2px 10px rgba(124,58,237,0.08)",
            }}
          >
            {attachment.type === "image" && attachment.preview ? (
              <img
                src={attachment.preview}
                alt={attachment.name}
                loading="lazy"
                className="max-w-[220px] max-h-48 object-cover"
              />
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
    </>
  );
};
