export { ChatProvider, useChat } from "./lib/ChatContext";
export { ChatModal } from "./ui/ChatModal";
export { ChatPage } from "./ui/ChatPage";
export { useChatCounters } from "./api";
export { setChatTheme, useChatThemeId } from "./lib/chatThemeStore";
export { CHAT_THEMES, DEFAULT_CHAT_THEME } from "./model/chatThemes";
export type { IChatThemeMeta, TChatThemeId } from "./model/chatThemes";
export type { Contact, Message, TChatVariant } from "./model/types";
