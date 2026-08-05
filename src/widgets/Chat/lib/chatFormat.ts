import type { MessageAttachment } from "../model";

/** Человекочитаемый размер файла: бэкенд отдаёт байты, UI показывает KB/MB. */
export const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

/** Время сообщения из ISO-даты бэкенда в формате ленты (24 ч). */
export const formatMessageTime = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

/** Тип вложения для UI: сначала верим полю бэкенда, иначе смотрим на MIME. */
export const resolveAttachmentType = (
  type?: string | null,
  mimeType?: string | null,
): MessageAttachment["type"] => {
  if (type === "voice") return "voice";
  if (type === "image" || type === "video" || type === "audio") return type;
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType?.startsWith("audio/")) return "audio";
  return "file";
};

const AVATAR_HUES = [265, 200, 330, 150, 25, 290];

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

/**
 * Заглушка аватара — инициалы на цветном круге.
 * Рисуем SVG в data-URL: аватар нужен в тех же `<img>`, что и загруженный файл,
 * а лишний сетевой запрос за плейсхолдером не нужен.
 */
export const buildInitialsAvatar = (name?: string | null) => {
  // Имя может не прийти вовсе (часть ручек отдаёт участника без ФИО) —
  // заглушка обязана пережить это: она рисуется до и вместо любых данных.
  const safeName = (name ?? "").trim() || "?";
  const hue =
    AVATAR_HUES[
      Math.abs(
        safeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
      ) % AVATAR_HUES.length
    ];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="hsl(${hue} 65% 55%)"/><text x="50%" y="52%" dy=".35em" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="26" font-weight="600" fill="#fff">${getInitials(
    safeName,
  )}</text></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Секунды из длительности голосового (бэкенд хранит миллисекунды). */
export const msToSeconds = (ms?: number | null) =>
  ms && ms > 0 ? Math.round(ms / 1000) : 0;
