import { useCallback, useEffect, useRef, useState } from "react";

interface IUseScrollActivityOptions {
  activeConversationId?: string | number | null;
  hideDelayMs?: number;
}

/**
 * Хук отслеживания активности скролла для Telegram-плавающей даты:
 * - Взводит `isScrolling = true` в момент прокрутки ленты.
 * - Плавно переводит `isScrolling = false` через `hideDelayMs` (1200 мс) после остановки.
 * - Автоматически сбрасывается при смене диалога.
 */
export const useFloatingChatDate = ({
  activeConversationId,
  hideDelayMs = 1200,
}: IUseScrollActivityOptions = {}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, hideDelayMs);
  }, [hideDelayMs]);

  useEffect(() => {
    setIsScrolling(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, [activeConversationId]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return {
    isScrolling,
    handleScroll,
  };
};
