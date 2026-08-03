import { _axios } from "@shared/api";
import { getEnvVar } from "@shared/config";

// ─── Приватные файлы чата ────────────────────────────────────────────────────
// Аватары и вложения отдаются только с Bearer-токеном, поэтому подставить их
// в `src` напрямую нельзя: <img> уходит на сервер без заголовка Authorization и
// получает 401. Файл забираем axios'ом как blob и показываем object-URL.
// Кэш общий на приложение: один и тот же аватар встречается в списке бесед,
// в шапке и в каждом сообщении.

const API_BASE = String(getEnvVar("VITE_API_URL")).replace(/\/+$/, "");

/** Больше этого числа object-URL в памяти не держим: самые старые освобождаем. */
const CACHE_LIMIT = 300;

const objectUrls = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

/** Готовые к вставке в `src` источники: их забирать через API не нужно. */
const isReadyToUse = (source: string) =>
  source.startsWith("data:") || source.startsWith("blob:");

/**
 * Ссылка ведёт на наш API (относительный путь или тот же хост) — значит, файл
 * приватный. Чужие абсолютные ссылки (внешний CDN) отдаём как есть.
 */
export const isPrivateMediaSource = (source: string) =>
  !isReadyToUse(source) &&
  (source.startsWith("/") || (Boolean(API_BASE) && source.startsWith(API_BASE)));

const toRequestPath = (source: string) =>
  API_BASE && source.startsWith(API_BASE) ? source.slice(API_BASE.length) : source;

const remember = (source: string, objectUrl: string) => {
  if (objectUrls.size >= CACHE_LIMIT) {
    const oldest = objectUrls.keys().next();
    if (!oldest.done) {
      URL.revokeObjectURL(objectUrls.get(oldest.value) as string);
      objectUrls.delete(oldest.value);
    }
  }
  objectUrls.set(source, objectUrl);
};

/** Уже загруженный object-URL, если файл забирали раньше. */
export const getCachedMedia = (source: string) => objectUrls.get(source);

/**
 * Загружает приватный файл и возвращает object-URL.
 * `null` — файла нет или доступ закрыт: вызывающий показывает заглушку.
 */
export const fetchPrivateMedia = async (source: string): Promise<string | null> => {
  const cached = objectUrls.get(source);
  if (cached) return cached;

  const pending = inflight.get(source);
  if (pending) return pending;

  const request = _axios
    .get<Blob>(toRequestPath(source), { responseType: "blob" })
    .then((response) => {
      const objectUrl = URL.createObjectURL(response.data);
      remember(source, objectUrl);
      return objectUrl;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(source);
    });

  inflight.set(source, request);
  return request;
};

/** Скачивание вложения: тот же приватный запрос, но с сохранением файла. */
export const downloadPrivateFile = async (path: string, fileName: string) => {
  const response = await _axios.get<Blob>(toRequestPath(path), {
    responseType: "blob",
  });

  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
