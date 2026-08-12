import { getEnvVar } from "@shared/config";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Фото автора комментария: photo_url приходит абсолютным, photo_path —
 * относительно публичного диска Laravel (/storage/).
 */
export const resolveCommentPhotoUrl = (
  photoUrl?: string | null,
  photoPath?: string | null,
): string => {
  const source = photoUrl || photoPath;
  if (!source) return "";
  if (/^(https?:|data:|blob:)/.test(source)) return source;

  const apiHost = String(getEnvVar("VITE_API_URL") || "");
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  let path = source.replace(/^\/+/, "");
  if (!path.startsWith("storage/")) path = `storage/${path}`;
  return `${host}/${path}`;
};

export const getCommentInitials = (fullName?: string | null): string => {
  if (!fullName) return "—";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p && p !== ".");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "—";
};

/** «Только что» / «Сегодня, 14:30» / «12.08.2026 14:30» */
export const formatCommentDate = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const diff = Date.now() - date.getTime();

  if (diff >= 0 && diff < MINUTE) return "Только что";
  if (diff >= 0 && diff < HOUR) {
    return `${Math.floor(diff / MINUTE)} мин назад`;
  }
  if (date.toDateString() === new Date().toDateString()) {
    return `Сегодня, ${time}`;
  }
  return `${date.toLocaleDateString("ru-RU")} ${time}`;
};
