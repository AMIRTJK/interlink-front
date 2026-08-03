import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPrivateMedia,
  getCachedMedia,
  isPrivateMediaSource,
} from "../api/chatMedia";

/**
 * Разрешает приватные пути к файлам в готовые для `<img src>` object-URL.
 *
 * Мапперы работают синхронно, а файл приходится забирать запросом с токеном,
 * поэтому картинки резолвятся отдельно: хук отдаёт словарь «путь → object-URL»,
 * а мапперы подставляют из него готовое значение либо заглушку с инициалами.
 * Уже загруженные файлы берутся из общего кэша без повторного запроса.
 */
export const useAuthorizedMedia = (sources: (string | null | undefined)[]) => {
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const requestedRef = useRef(new Set<string>());

  const targets = useMemo(
    () =>
      Array.from(
        new Set(
          sources.filter(
            (source): source is string => !!source && isPrivateMediaSource(source),
          ),
        ),
      ),
    [sources],
  );

  // Стабильный ключ списка: массив пересобирается на каждый рендер родителя,
  // а перезапускать загрузку нужно только при смене самого набора путей.
  const targetsKey = targets.join("|");

  useEffect(() => {
    let isCancelled = false;

    // Разбираем ключ обратно в список: так зависимость эффекта честная и он не
    // перезапускается из-за пересоздания массива на каждый рендер родителя.
    const pending = (targetsKey ? targetsKey.split("|") : []).filter(
      (source) => !requestedRef.current.has(source),
    );
    if (!pending.length) return;

    pending.forEach((source) => requestedRef.current.add(source));

    // Уже загруженные файлы отдаются из кэша при чтении — запрашиваем остальные.
    const missing = pending.filter((source) => !getCachedMedia(source));
    if (!missing.length) return;

    void Promise.all(
      missing.map(async (source) => {
        const objectUrl = await fetchPrivateMedia(source);
        return [source, objectUrl] as const;
      }),
    ).then((entries) => {
      if (isCancelled) return;
      const loaded: Record<string, string> = {};
      entries.forEach(([source, objectUrl]) => {
        if (objectUrl) loaded[source] = objectUrl;
      });
      if (Object.keys(loaded).length) {
        setResolved((prev) => ({ ...prev, ...loaded }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [targetsKey]);

  // Кэш общий на приложение: тот же аватар мог загрузить другой экран чата.
  return useMemo(() => {
    const merged: Record<string, string> = {};
    targets.forEach((source) => {
      const cached = getCachedMedia(source);
      if (cached) merged[source] = cached;
    });
    return { ...merged, ...resolved };
  }, [targets, resolved]);
};
