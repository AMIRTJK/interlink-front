import React from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { If } from "@shared/ui";
import { Contact, LayoutPosition, CHAT_LIST_PANEL_WIDTH } from "../../model";
import { buildInitialsAvatar } from "../../lib/chatFormat";
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
        className="flex-shrink-0 flex flex-col border-white/10 overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg,rgba(76,29,149,0.55),rgba(124,58,237,0.4),rgba(6,182,212,0.25))"
            : "linear-gradient(135deg,rgba(237,233,254,0.65),rgba(243,244,246,0.65),rgba(207,250,254,0.65))",
          borderTop:
            layout === "bottom"
              ? isDark
                ? "1px solid rgba(167,139,250,0.2)"
                : "1px solid rgba(124,58,237,0.15)"
              : undefined,
          borderBottom:
            layout === "top"
              ? isDark
                ? "1px solid rgba(167,139,250,0.2)"
                : "1px solid rgba(124,58,237,0.15)"
              : undefined,
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
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/20" : "hover:bg-black/5"}`}
            style={{
              background: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.03)",
              border: isDark
                ? "2px dashed rgba(255,255,255,0.25)"
                : "2px dashed rgba(0,0,0,0.15)",
            }}
          >
            <Plus className={`w-4 h-4 ${isDark ? "text-white/50" : "text-gray-500"}`} />
          </button>
          <div
            className="w-px h-8 mx-1 flex-shrink-0"
            style={{
              background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
          />
          {filteredContacts.map((contact) => {
            const isActive = contact.id === activeContactId;
            const unread = contact.unreadCount || 0;
            return (
              <button
                key={contact.id}
                onClick={() => onContactSwitch(contact.id)}
                aria-label={contact.name}
                className={`chat-avatar-button relative flex-shrink-0 flex flex-col items-center gap-1 px-1 py-1 rounded-xl transition-all duration-200 ease-in-out ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
              >
                <span
                  className={`chat-avatar${isActive ? " chat-avatar--active" : ""}`}
                >
                  {/* Контур и ореол — оформление: скрыты от скринридера. */}
                  <span aria-hidden="true" className="chat-avatar__ring" />
                  <span aria-hidden="true" className="chat-avatar__halo" />
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
                      className="absolute bottom-0 right-0 z-20 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                      style={{
                        boxShadow: "0 0 6px rgba(74,222,128,0.8)",
                      }}
                    />
                  )}
                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-md"
                      style={{
                        background: "linear-gradient(135deg,#ef4444,#f97316)",
                      }}
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
        background: isDark ? "rgba(15,5,40,0.6)" : "rgba(255,255,255,0.7)",
        borderRight:
          layout === "left"
            ? isDark
              ? "1px solid rgba(167,139,250,0.15)"
              : "1px solid rgba(167,139,250,0.2)"
            : undefined,
        borderLeft:
          layout === "right"
            ? isDark
              ? "1px solid rgba(167,139,250,0.15)"
              : "1px solid rgba(167,139,250,0.2)"
            : undefined,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Panel header */}
      <div
        className={`flex items-center justify-between px-4 py-3 flex-shrink-0 border-b ${isDark ? "border-white/8" : "border-black/5"}`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/70" : "text-gray-500"}`}
        >
          Chats
        </span>
      </div>
      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
          style={{
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Search
            className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-white/35" : "text-gray-400"}`}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-white/25 text-white" : "placeholder-gray-400 text-gray-800"}`}
          />
        </div>
      </div>
      {/* Contact list */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden py-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: isDark
            ? "rgba(167,139,250,0.2) transparent"
            : "rgba(124,58,237,0.2) transparent",
        }}
      >
        <If is={isLoading && filteredContacts.length === 0}>
          <p
            className={`text-center text-xs py-6 ${isDark ? "text-white/40" : "text-gray-400"}`}
          >
            {loadingLabel}
          </p>
        </If>
        <If is={!isLoading && filteredContacts.length === 0}>
          <p
            className={`text-center text-xs py-6 ${isDark ? "text-white/40" : "text-gray-400"}`}
          >
            {emptyLabel}
          </p>
        </If>
        {filteredContacts.map((contact) => {
          const isActive = contact.id === activeContactId;
          const unread = contact.unreadCount || 0;
          return (
            <button
              key={contact.id}
              onClick={() => onContactSwitch(contact.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ease-in-out group"
              style={
                isActive
                  ? {
                      background: isDark
                        ? "linear-gradient(90deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                        : "linear-gradient(90deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))",
                      borderLeft: isDark
                        ? "2px solid rgba(167,139,250,0.8)"
                        : "2px solid rgba(124,58,237,0.8)",
                      paddingLeft: "10px",
                    }
                  : {
                      borderLeft: "2px solid transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
                  (e.currentTarget as HTMLButtonElement).style.borderLeft =
                    isDark
                      ? "2px solid rgba(167,139,250,0.4)"
                      : "2px solid rgba(124,58,237,0.4)";
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
                  className="w-9 h-9 rounded-full object-cover transition-transform duration-200 group-hover:scale-105 overflow-hidden"
                  style={{
                    boxShadow: isActive
                      ? isDark
                        ? "inset 0 0 0 2px rgba(167,139,250,0.6)"
                        : "inset 0 0 0 2px rgba(124,58,237,0.6)"
                      : isDark
                        ? "inset 0 0 0 2px rgba(255,255,255,0.15)"
                        : "inset 0 0 0 2px rgba(0,0,0,0.1)",
                  }}
                />
                {contact.online && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                    style={{
                      boxShadow: "0 0 5px rgba(74,222,128,0.7)",
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className={`text-sm font-semibold truncate transition-colors duration-200 ${isActive ? (isDark ? "text-white" : "text-gray-900") : isDark ? "text-white/75 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"}`}
                  >
                    {contact.name}
                  </p>
                  {unread > 0 && (
                    <span
                      className="min-w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#ef4444,#f97316)",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs truncate transition-colors duration-200 ${isDark ? "text-white/40 group-hover:text-white/60" : "text-gray-400 group-hover:text-gray-600"}`}
                >
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
