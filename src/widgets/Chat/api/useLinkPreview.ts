import { useEffect, useState } from "react";
import { useGetQuery } from "@shared/lib";
import type { IChatLinkPreview } from "../model";
import { extractFirstUrl } from "../lib/chatLinks";
import { chatUrls } from "./chatUrls";

// Превью ссылки. Страницу читает бэкенд: из браузера чужой сайт не открыть —
// CORS не отдаст ни og-разметку, ни заголовок. Ответ бэкенд кэширует на 10
// минут, поэтому свой кэш держим примерно столько же.

/** Пауза после последнего нажатия клавиши: адрес ещё дописывают. */
const TYPING_PAUSE_MS = 600;
/** Метаданные страницы меняются редко — держим ответ в кэше подольше. */
const PREVIEW_STALE_TIME = 10 * 60 * 1000;

/**
 * Метаданные одного адреса. Ошибку (403 без права `chat.view`, 422 на
 * неподдерживаемой ссылке, 429 на лимите, 502 на недоступном сайте) гасим
 * молча: превью — необязательное дополнение, ломать им переписку нельзя.
 *
 * `isEnabled` позволяет отложить запрос до того момента, когда карточка
 * действительно понадобится, — на бэкенде лимит 30 запросов в минуту.
 */
export const useLinkPreview = (url: string | null, isEnabled = true) => {
  const { data, isLoading, isError } = useGetQuery<
    { url: string },
    { data?: IChatLinkPreview }
  >({
    url: chatUrls.linkPreview,
    params: url ? { url } : undefined,
    useToken: true,
    options: {
      enabled: Boolean(url) && isEnabled,
      staleTime: PREVIEW_STALE_TIME,
    },
  });

  const preview = data?.data;

  // Все опциональные поля пустые — показывать нечего, карточку не рисуем.
  const hasContent = Boolean(
    preview?.title || preview?.description || preview?.image,
  );

  return {
    preview: !isError && hasContent ? preview : undefined,
    isLoading: Boolean(url) && isEnabled && Boolean(isLoading),
  };
};

/**
 * Превью для поля ввода: ищет первую ссылку в набранном тексте и ждёт паузы
 * в печати, чтобы не дёргать бэкенд на каждый символ недописанного адреса.
 */
export const useComposerLinkPreview = (text: string) => {
  const url = extractFirstUrl(text);
  const [debouncedUrl, setDebouncedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDebouncedUrl(null);
      return;
    }

    const timer = setTimeout(() => setDebouncedUrl(url), TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [url]);

  const { preview, isLoading } = useLinkPreview(debouncedUrl);

  return { url: debouncedUrl, preview, isLoading };
};
