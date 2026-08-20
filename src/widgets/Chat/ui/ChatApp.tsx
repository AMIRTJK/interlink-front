import { useEffect, useLayoutEffect, type ComponentType } from "react";
import { type TChatVariant } from "../model";
import type { TChatThemeId } from "../model/chatThemes";
import { useChatAppState } from "../lib/useChatAppState";
import { applyChatThemeAttribute, useChatThemeId } from "../lib/chatThemeStore";
import { ChatOverlays } from "./ChatOverlays";
import type { IChatShellProps } from "./themes/types";
import { ClassicShell } from "./themes/classic/ClassicShell";
import { ModernShell } from "./themes/modern/ModernShell";
import "./themes/modern/modern.css";

// ─── Точка сборки чата ────────────────────────────────────────────────────────
// Состояние, серверные данные и обработчики живут в useChatAppState и считаются
// здесь ровно один раз. Оформление выбирает только оболочку, которая это
// состояние раскладывает: API, кэш, сокеты и логика у всех оформлений общие.
// Новое оформление = запись в CHAT_THEMES, набор токенов в CSS и оболочка в
// SHELLS — ни данные, ни обработчики при этом не трогаются.

const SHELLS: Record<TChatThemeId, ComponentType<IChatShellProps>> = {
  classic: ClassicShell,
  modern: ModernShell,
};

interface IProps {
  onComposeStateChange?: (isOpen: boolean) => void;
  onRequestClose?: () => void;
  /** Режим отображения: полноценная страница модуля или всплывающее окно. */
  variant?: TChatVariant;
  /** Развёрнут ли всплывающий чат на весь экран (только для variant="overlay"). */
  isExpanded?: boolean;
  /** Переключение «компактное окно ↔ весь экран». Кнопка появляется, только если передан. */
  onToggleExpand?: () => void;
}

export const ChatApp = ({
  onComposeStateChange,
  onRequestClose,
  variant = "overlay",
  isExpanded = false,
  onToggleExpand,
}: IProps) => {
  const state = useChatAppState(onComposeStateChange);
  const themeId = useChatThemeId();
  const Shell = SHELLS[themeId];

  // Токены оформления живут на <html>: только так они достают до порталов —
  // меню действий, палитры реакций и просмотра вложений. Ставим до отрисовки,
  // иначе первый кадр чат рисует токенами прежнего оформления.
  useLayoutEffect(() => {
    applyChatThemeAttribute(themeId);
  }, [themeId]);

  const { openThreadMsg, threadMessages, markThreadSeen } = state;

  // Пока тред открыт, всё пришедшее в него считается прочитанным — и чужие
  // ответы, и свои. Закрыли панель — следующий ответ снова будет новым.
  useEffect(() => {
    if (!openThreadMsg) return;
    markThreadSeen(
      openThreadMsg.id,
      Math.max(openThreadMsg.threadCount ?? 0, threadMessages.length),
    );
  }, [openThreadMsg, threadMessages.length, markThreadSeen]);

  return (
    <>
      <Shell
        state={state}
        variant={variant}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onRequestClose={onRequestClose}
      />
      <ChatOverlays state={state} />
    </>
  );
};
