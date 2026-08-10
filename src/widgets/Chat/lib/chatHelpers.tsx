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

export const GLASS_CARD =
  "backdrop-blur-2xl bg-[var(--th-panel-bg)] border border-[var(--th-panel-border)]";

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
  isTargetHighlighted,
}: IAttachmentBubbleStyle): React.CSSProperties => {
  if (isTargetHighlighted) {
    return {
      background: "var(--th-bubble-out-bg)",
      border: "2px solid rgb(var(--th-on-accent-rgb))",
      boxShadow:
        "0 0 28px rgb(var(--th-accent-2-rgb) / 0.9), 0 0 12px rgb(var(--th-accent-rgb) / 0.8)",
    };
  }

  if (isImage) return {};

  if (isMe) {
    return {
      background: "var(--th-bubble-out-bg)",
      border: "1px solid var(--th-bubble-out-border)",
      boxShadow: "var(--th-glow-accent)",
    };
  }

  return {
    background: "var(--th-bubble-in-bg)",
    border: "1px solid var(--th-bubble-in-border)",
    boxShadow: "var(--th-shadow-soft)",
  };
};
