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
// Провайдер хранит состояние «открыт/закрыт» и сам рендерит полноэкранное модальное
// окно поверх всей системы. Любой компонент (например, кнопка в хедере) открывает
// чат через useChat(), не завися от текущей страницы/роутинга.

type ChatContextValue = {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ isOpen, openChat, closeChat, toggleChat }),
    [isOpen, openChat, closeChat, toggleChat],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatModal open={isOpen} onClose={closeChat} />
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
