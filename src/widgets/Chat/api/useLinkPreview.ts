import { useEffect, useState } from "react";
import { useGetQuery } from "@shared/lib";
import type { IChatLinkPreview } from "../model";
import { extractFirstUrl } from "../lib/chatLinks";
import { chatUrls } from "./chatUrls";

// Превью ссылки для поля ввода. Страницу читает бэкенд: из браузера чужой сайт
// не открыть — CORS не отдаст ни og-разметку, ни заголовок.

/** Пауза после последнего нажатия клавиши: адрес ещё дописывают. */
const TYPING_PAUSE_MS = 600;
/** Метаданные страницы меняются редко — держим ответ в кэше подольше. */
const PREVIEW_STALE_TIME = 10 * 60 * 1000;

/**
 * Ищет ссылку в тексте и подтягивает её метаданные. Пока адрес дописывают,
 * запрос не уходит; ошибка (нет ручки, сайт недоступен, страница без разметки)
 * гасится молча — превью необязательно, ломать им отправку нельзя.
 */
export const useLinkPreview = (text: string) => {
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

  const { data, isLoading, isError } = useGetQuery<
    { url: string },
    { data?: IChatLinkPreview }
  >({
    url: chatUrls.linkPreview,
    params: debouncedUrl ? { url: debouncedUrl } : undefined,
    useToken: true,
    options: {
      enabled: Boolean(debouncedUrl),
      staleTime: PREVIEW_STALE_TIME,
    },
  });

  const preview = data?.data;
  const hasContent = Boolean(preview?.title || preview?.description || preview?.image);

  return {
    url: debouncedUrl,
    preview: !isError && hasContent ? preview : undefined,
    isLoading: Boolean(debouncedUrl) && Boolean(isLoading),
  };
};
