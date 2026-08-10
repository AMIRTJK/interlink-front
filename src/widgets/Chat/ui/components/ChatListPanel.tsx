import React from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { If } from "@shared/ui";
import { Contact, LayoutPosition, CHAT_LIST_PANEL_WIDTH } from "../../model";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import {
  CHAT_AVATAR_CLIP_VAR,
  CHAT_AVATAR_OUTLINE_CLIP_VAR,
  getChatAvatarClipPath,
  getChatAvatarOutlineClipPath,
} from "../../lib/chatAvatarShape";
import "../../style.css";

interface ChatListPanelProps {
  layout: LayoutPosition;
  contacts: Contact[];
  activeContactId: string;
  searchQuery: string;
  isLoading: boolean;
  emptyLabel: string;
  loadingLabel: string;
  searchPlaceholder: string;
  onContactSwitch: (id: string) => void;
  onComposeOpen: () => void;
  onSearchChange: (v: string) => void;
  isDark: boolean;
  /** Ширина в вертикальных макетах, px. По умолчанию — CHAT_LIST_PANEL_WIDTH. */
  width?: number;
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  layout,
  contacts: filteredContacts,
  activeContactId,
  searchQuery,
  isLoading,
  emptyLabel,
  loadingLabel,
  searchPlaceholder,
  onContactSwitch,
  onComposeOpen,
  onSearchChange,
  isDark,
  width = CHAT_LIST_PANEL_WIDTH,
}) => {
  const isHorizontal = layout === "top" || layout === "bottom";

  if (isHorizontal) {
    return (
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          // Полоса аватарок тонируется акцентом активной темы: на светлой
          // подложке акцент насыщеннее, на тёмной — глубже, за это отвечает
          // токен --th-rail-bg.
          background: "var(--th-rail-bg)",
          borderTop:
            layout === "bottom" ? "1px solid var(--th-rail-border)" : undefined,
          borderBottom:
            layout === "top" ? "1px solid var(--th-rail-border)" : undefined,
          backdropFilter: "blur(20px)",
          height: "80px",
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 h-full overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={onComposeOpen}
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)]"
            style={{
              // Кнопка и разделитель держатся на акценте темы, а не на
              // нейтральном чёрном: на тонированной полосе он выглядит грязным.
              background: "rgb(var(--th-accent-rgb) / 0.08)",
              border: "2px dashed var(--th-accent-border)",
            }}
          >
            <Plus className="w-4 h-4 text-[var(--th-accent-text)]" />
          </button>
          <div
            className="w-px h-8 mx-1 flex-shrink-0"
            style={{ background: "rgb(var(--th-accent-rgb) / 0.22)" }}
          />
          {filteredContacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            const unread = contact.unreadCount || 0;
            const clipPath = getChatAvatarClipPath(contact);
            return (
              <button
                key={contact.id}
                onClick={() => onContactSwitch(contact.id)}
                aria-label={contact.name}
                className="chat-avatar-button relative flex-shrink-0 flex flex-col items-center gap-1 px-1 py-1"
              >
                <span
                  className={`chat-avatar${isDark ? " chat-avatar--dark" : ""}${
                    isActive ? " chat-avatar--active" : ""
                  }${clipPath ? " chat-avatar--shaped" : ""}`}
                  style={
                    clipPath
                      ? {
                          [CHAT_AVATAR_CLIP_VAR as string]: clipPath,
                          [CHAT_AVATAR_OUTLINE_CLIP_VAR as string]:
                            getChatAvatarOutlineClipPath(contact) ?? clipPath,
                        }
                      : undefined
                  }
                >
                  {/* Контур и ореол — оформление: скрыты от скринридера.
                      Ореол идёт первым: у фигурных аватарок он залит и должен
                      оказаться под контуром, а не поверх него. */}
                  <span aria-hidden="true" className="chat-avatar__halo" />
                  <span aria-hidden="true" className="chat-avatar__ring" />
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    width={40}
                    height={40}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        buildInitialsAvatar(contact.name);
                    }}
                    className="chat-avatar__img"
                  />
                  {contact.online && (
                    <span
                      className="absolute bottom-0 right-0 z-20 w-2.5 h-2.5 bg-[var(--th-online)] border-2 border-transparent rounded-full"
                      style={{ boxShadow: "var(--th-online-glow)" }}
                    />
                  )}
                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] rounded-full text-[var(--th-on-accent)] text-[9px] font-bold flex items-center justify-center px-0.5 shadow-md"
                      style={{ background: "var(--th-badge-unread)" }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout (left / right)
  return (
    <motion.div
      key={`chat-list-${layout}`}
      initial={{
        opacity: 0,
        x: layout === "left" ? -20 : 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width,
        background: "var(--th-sidebar-bg)",
        borderRight:
          layout === "left" ? "1px solid var(--th-sidebar-border)" : undefined,
        borderLeft:
          layout === "right" ? "1px solid var(--th-sidebar-border)" : undefined,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-[var(--th-divider)]">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--th-text-muted)]">
          Chats
        </span>
      </div>
      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
          style={{
            background: "var(--th-input-bg)",
            border: "1px solid var(--th-chip-border)",
          }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0 text-[var(--th-text-faint)]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
          />
        </div>
      </div>
      {/* Contact list */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden py-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(var(--th-accent-rgb) / 0.2) transparent",
        }}
      >
        <If is={isLoading && filteredContacts.length === 0}>
          <p className="text-center text-xs py-6 text-[var(--th-text-faint)]">
            {loadingLabel}
          </p>
        </If>
        <If is={!isLoading && filteredContacts.length === 0}>
          <p className="text-center text-xs py-6 text-[var(--th-text-faint)]">
            {emptyLabel}
          </p>
        </If>
        {filteredContacts.map((contact) => {
          const isActive = contact.id === activeContactId;
          const unread = contact.unreadCount || 0;
          const clipPath = getChatAvatarClipPath(contact);
          // У фигурной аватарки внутренняя обводка обрезается вместе с углами
          // и распадается на куски — форму и обводку не совмещаем.
          const avatarShapeStyle = clipPath ? { clipPath } : undefined;
          return (
            <button
              key={contact.id}
              onClick={() => onContactSwitch(contact.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ease-in-out group"
              style={
                isActive
                  ? {
                      background: "var(--th-list-active-bg)",
                      borderLeft: "2px solid var(--th-list-active-border)",
                      paddingLeft: "10px",
                    }
                  : {
                      borderLeft: "2px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--th-hover-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderLeft =
                    "2px solid var(--th-list-hover-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderLeft =
                    "2px solid transparent";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateX(0)";
                }
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      buildInitialsAvatar(contact.name);
                  }}
                  className={`w-9 h-9 object-cover transition-transform duration-200 group-hover:scale-105 overflow-hidden ${clipPath ? "" : "rounded-full"}`}
                  style={
                    avatarShapeStyle ?? {
                      boxShadow: isActive
                        ? "inset 0 0 0 2px rgb(var(--th-accent-rgb) / 0.6)"
                        : "inset 0 0 0 2px var(--th-chip-border)",
                    }
                  }
                />
                {contact.online && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--th-online)] border-2 border-transparent rounded-full"
                    style={{ boxShadow: "var(--th-online-glow)" }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={`text-sm font-semibold truncate transition-colors duration-200 ${isActive ? "text-[var(--th-text)]" : "text-[var(--th-text-muted)] group-hover:text-[var(--th-text)]"}`}
                  >
                    {contact.name}
                  </p>
                  {unread > 0 && (
                    <span
                      className="min-w-[18px] h-[18px] rounded-full text-[var(--th-on-accent)] text-[9px] font-bold flex items-center justify-center px-0.5 flex-shrink-0"
                      style={{ background: "var(--th-badge-unread)" }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate transition-colors duration-200 text-[var(--th-text-faint)] group-hover:text-[var(--th-text-muted)]">
                  {contact.lastMessage}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
