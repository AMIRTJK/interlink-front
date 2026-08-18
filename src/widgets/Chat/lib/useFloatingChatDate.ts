import { useCallback, useEffect, useRef, useState } from "react";

interface IUseFloatingChatDateOptions {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  activeConversationId?: string | number | null;
  hideDelayMs?: number;
}

/**
 * Хук отслеживания плавающей даты при скролле (Telegram-стиль):
 * - Включает отображение во время активного скролла.
 * - Вычисляет текущую дату по положению видимых сообщений/разделителей.
 * - Скрывает плавающую плашку при совпадении с реальным разделителем в ленте.
 * - Плавно гасит плашку через `hideDelayMs` после прекращения прокрутки.
 */
export const useFloatingChatDate = ({
  scrollRef,
  activeConversationId,
  hideDelayMs = 1200,
}: IUseFloatingChatDateOptions) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [floatingDate, setFloatingDate] = useState<string | null>(null);
  const [isRealDividerVisible, setIsRealDividerVisible] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateFloatingDate = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const dividers = Array.from(
      container.querySelectorAll<HTMLElement>('[data-chat-date-divider="true"]'),
    );

    if (dividers.length === 0) {
      setFloatingDate(null);
      setIsRealDividerVisible(false);
      return;
    }

    const containerRect = container.getBoundingClientRect();

    // Верхняя граница зоны плавающего индикатора
    const TOP_THRESHOLD = 36;
    // Диапазон, в котором реальный разделитель считается находящимся прямо у верхней кромки
    const OVERLAP_MIN = -12;
    const OVERLAP_MAX = 44;

    let currentDivider: HTMLElement | null = null;
    let isCurrentDividerAtTop = false;

    for (let i = 0; i < dividers.length; i++) {
      const divider = dividers[i];
      const rect = divider.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;

      if (relativeTop <= TOP_THRESHOLD) {
        currentDivider = divider;
        if (relativeTop >= OVERLAP_MIN && relativeTop <= OVERLAP_MAX) {
          isCurrentDividerAtTop = true;
        } else {
          isCurrentDividerAtTop = false;
        }
      } else {
        // Если даже первый разделитель ниже порога
        if (i === 0) {
          currentDivider = divider;
          if (relativeTop >= OVERLAP_MIN && relativeTop <= OVERLAP_MAX + 30) {
            isCurrentDividerAtTop = true;
          }
        }
        break;
      }
    }

    if (currentDivider) {
      const dateText = currentDivider.getAttribute("data-chat-date-text") || "";
      setFloatingDate(dateText || null);
      setIsRealDividerVisible(isCurrentDividerAtTop);
    } else {
      setFloatingDate(null);
      setIsRealDividerVisible(false);
    }
  }, [scrollRef]);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, hideDelayMs);

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      updateFloatingDate();
    });
  }, [hideDelayMs, updateFloatingDate]);

  // Сброс состояния при переключении чата
  useEffect(() => {
    setIsScrolling(false);
    setFloatingDate(null);
    setIsRealDividerVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
  }, [activeConversationId]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const isVisible = isScrolling && Boolean(floatingDate) && !isRealDividerVisible;

  return {
    isScrolling,
    floatingDate,
    isVisible,
    handleScroll,
    updateFloatingDate,
  };
};
