import { useCallback, useEffect, useState } from "react";

/**
 * Отметка о прочитанных ответах треда.
 *
 * Бэкенд отдаёт только общее число ответов (`thread_count`), поэтому непрочитанное
 * считаем сами: запоминаем, сколько ответов человек уже видел, и всё сверх этого
 * показываем как новое. Отметка лежит в localStorage, то есть живёт в пределах
 * браузера — на другом устройстве тред снова будет выглядеть непрочитанным.
 * Как только на сервере появится счётчик непрочитанного, этот хук заменяется
 * полем из ответа без правок в разметке.
 */
const STORAGE_KEY = "chat:thread-seen-replies";

type TSeenReplies = Record<string, number>;

const readSeenReplies = (): TSeenReplies => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TSeenReplies) : {};
  } catch {
    // Хранилище может быть недоступно или испорчено — тогда все треды просто
    // считаются новыми, ломать из-за этого чат нельзя.
    return {};
  }
};

export const useThreadReadState = () => {
  const [seenReplies, setSeenReplies] = useState<TSeenReplies>(readSeenReplies);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seenReplies));
    } catch (error) {
      console.error("Не удалось сохранить прочитанные ответы треда:", error);
    }
  }, [seenReplies]);

  /** Тред открыт и просмотрен: всё, что пришло позже, снова станет новым. */
  const markThreadSeen = useCallback(
    (messageId: string, repliesCount: number) => {
      setSeenReplies((prev) =>
        (prev[messageId] ?? 0) >= repliesCount
          ? prev
          : { ...prev, [messageId]: repliesCount },
      );
    },
    [],
  );

  const getUnreadThreadCount = useCallback(
    (messageId: string, repliesCount: number) =>
      Math.max(0, repliesCount - (seenReplies[messageId] ?? 0)),
    [seenReplies],
  );

  return { markThreadSeen, getUnreadThreadCount };
};
