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
