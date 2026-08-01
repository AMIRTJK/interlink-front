import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChatModal } from "../ui/ChatModal";

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
