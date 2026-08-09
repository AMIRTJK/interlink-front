import React from "react";
import { FileText, ImageIcon, Film, Music } from "lucide-react";
import { type MessageAttachment } from "../model";

export const formatTime = (d: Date) => {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

export const getAttachmentIcon = (type: MessageAttachment["type"]) => {
  if (type === "image") return <ImageIcon className="w-4 h-4" />;
  if (type === "video") return <Film className="w-4 h-4" />;
  if (type === "audio" || type === "voice")
    return <Music className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

export const GLASS_CARD = "backdrop-blur-2xl bg-white/10 border border-white/20";

interface IAttachmentBubbleStyle {
  isImage: boolean;
  isMe: boolean;
  isDark: boolean;
  isTargetHighlighted?: boolean;
}

/**
 * Оформление пузыря вложения. У картинки его нет: она непрозрачна и заполняет
 * пузырь целиком, так что от подложки остаётся только кайма и вылезающий
 * из-под скруглений угол. Подсветка перехода к сообщению остаётся — она несёт
 * смысл, а не оформление.
 */
export const getAttachmentBubbleStyle = ({
  isImage,
  isMe,
  isDark,
  isTargetHighlighted,
}: IAttachmentBubbleStyle): React.CSSProperties => {
  if (isTargetHighlighted) {
    return {
      background:
        "linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247), rgb(59, 130, 246))",
      border: "2px solid #ffffff",
      boxShadow:
        "0 0 28px rgba(236, 72, 153, 0.9), 0 0 12px rgba(168, 85, 247, 0.8)",
    };
  }

  if (isImage) return {};

  if (isMe) {
    return {
      background:
        "linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247), rgb(6, 182, 212))",
      border: "1px solid rgba(196,181,253,0.5)",
      boxShadow: "0 0 16px rgba(124, 58, 237, 0.5)",
    };
  }

  return {
    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.95)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.15)"
      : "1px solid rgba(124,58,237,0.2)",
    boxShadow: isDark
      ? "0 2px 10px rgba(0,0,0,0.2)"
      : "0 2px 10px rgba(124,58,237,0.08)",
  };
};
