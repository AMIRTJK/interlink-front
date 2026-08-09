import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tokenControl, useCurrentUser } from "@shared/lib";
import { ChatModal } from "../ui/ChatModal";
import { useGlobalChatRealtime, usePresenceHeartbeat } from "../api";

// ─── Глобальный доступ к чату ─────────────────────────────────────────────────
// Провайдер хранит состояние всплывающего чата («открыт/закрыт» и «компактное
// окно/весь экран») и сам рендерит его поверх всей системы. Любой компонент
// (кнопка в хедере, плавающая кнопка модуля) открывает чат через useChat(),
// не завися от текущей страницы/роутинга. Полноценный раздел «Чат»
// (AppRoutes.CHAT) работает независимо от этого состояния.

type ChatContextValue = {
  isOpen: boolean;
  /** Развёрнут ли всплывающий чат на весь экран. */
  isExpanded: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleExpand: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { user } = useCurrentUser();
  const currentUserId = user?.id ?? null;

  // Присутствие отмечаем на уровне приложения, а не открытого чата: коллеги
  // должны видеть пользователя в сети, пока он работает в системе.
  usePresenceHeartbeat(Boolean(tokenControl.get()));

  // Глобальная фоновая подписка Reverb (вебсокетов) на сообщения и счётчики:
  // благодаря ей плавающая кнопка обновляет счётчик непрочитанных в реальном времени.
  useGlobalChatRealtime(currentUserId);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);
  const toggleExpand = useCallback(() => setIsExpanded((v) => !v), []);

  const value = useMemo(
    () => ({
      isOpen,
      isExpanded,
      openChat,
      closeChat,
      toggleChat,
      toggleExpand,
    }),
    [isOpen, isExpanded, openChat, closeChat, toggleChat, toggleExpand],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatModal
        open={isOpen}
        onClose={closeChat}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
      />
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a <ChatProvider>");
  }
  return ctx;
};
