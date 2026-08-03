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
            className={`mb-1.5 rounded-2xl overflow-hidden transition-all duration-200 ease-in-out hover:brightness-110 ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
            style={{
              border: isMe
                ? "1px solid rgba(167,139,250,0.35)"
                : "1px solid rgba(255,255,255,0.12)",
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
                className="flex items-center gap-2 px-3 py-2.5 min-w-[180px] bg-white/8 text-left w-full"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-300 flex-shrink-0 bg-violet-500/20">
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate text-white/80">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-white/40">{attachment.size}</p>
                </div>
                <Download className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};
