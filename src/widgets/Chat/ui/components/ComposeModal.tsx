import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, X, Search, Loader2 } from "lucide-react";
import { If } from "@shared/ui";
import { useDebouncedCallback } from "@shared/lib";
import { useChatUsers } from "../../api";
import {
  getUserAvatarSource,
  mapUserToContact,
  type IChatLabels,
} from "../../lib/chatMappers";
import { useAuthorizedMedia } from "../../lib/useAuthorizedMedia";
import { OnlineIndicator } from "./OnlineIndicator";

// Выбор сотрудника для личного чата. Список приходит из GET /chat/users,
// поиск идёт на бэкенде (ФИО и должность), поэтому строка уходит с debounce.

const SEARCH_DEBOUNCE_MS = 350;

interface ComposeModalProps {
  onClose: () => void;
  /** Создаёт (или открывает существующий) личный чат с сотрудником. */
  onSelectUser: (userId: number) => void;
  isCreating: boolean;
  isDark: boolean;
  labels: IChatLabels;
  title: string;
  searchPlaceholder: string;
  noResultsLabel: string;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  onClose,
  onSelectUser,
  isCreating,
  isDark,
  labels,
  title,
  searchPlaceholder,
  noResultsLabel,
}) => {
  const [composeSearch, setComposeSearch] = useState("");
  const [query, setQuery] = useState("");

  const applySearch = useDebouncedCallback(
    ((value: string) => setQuery(value)) as (...args: unknown[]) => void,
    SEARCH_DEBOUNCE_MS,
  );

  const { users, isLoading } = useChatUsers(query, true);

  const avatarSources = useMemo(
    () => users.map((user) => getUserAvatarSource(user)),
    [users],
  );
  const media = useAuthorizedMedia(avatarSources);

  const contacts = useMemo(
    () =>
      users.map((user) =>
        mapUserToContact(user, { currentUserId: null, media, labels }),
      ),
    [users, media, labels],
  );

  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "var(--th-scrim)",
        backdropFilter: "blur(20px)",
      }}
    >
      <style>{`
      .compose-modal-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .compose-modal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .compose-modal-scroll::-webkit-scrollbar-thumb {
        background: rgb(var(--th-overlay-rgb) / 0.15);
        border-radius: 9999px;
      }
      .compose-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: rgb(var(--th-overlay-rgb) / 0.3);
      }
      .compose-modal-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgb(var(--th-overlay-rgb) / 0.15) transparent;
      }
    `}</style>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)] text-[var(--th-text)]"
        style={{
          boxShadow: "0 20px 60px rgb(var(--th-accent-rgb) / 0.25)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-[var(--th-divider)]"
        >
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[var(--th-accent-text)]" />
            <h3
              className="font-semibold text-sm text-[var(--th-text)]"
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          className="px-4 py-3 border-b border-[var(--th-divider)]"
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 bg-[var(--th-input-bg)] border border-[var(--th-input-border)]"
          >
            <Search
              className="w-4 h-4 flex-shrink-0 text-[var(--th-text-faint)]"
            />
            <input
              autoFocus
              type="text"
              placeholder={searchPlaceholder}
              value={composeSearch}
              onChange={(e) => {
                setComposeSearch(e.target.value);
                applySearch(e.target.value);
              }}
              className="flex-1 bg-transparent outline-none text-sm text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
            />
            <If is={isLoading || isCreating}>
              <Loader2 className="w-4 h-4 animate-spin text-[var(--th-accent-text)]" />
            </If>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto py-2 compose-modal-scroll">
          <If is={!isLoading && contacts.length === 0}>
            <p
              className="text-center text-xs py-8 text-[var(--th-text-faint)]"
            >
              {noResultsLabel}
            </p>
          </If>
          {contacts.map((contact) => (
            <button
              key={contact.id}
              disabled={isCreating}
              onClick={() => {
                if (contact.peerId) onSelectUser(contact.peerId);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out text-left group disabled:opacity-60 hover:bg-[var(--th-hover-bg)]"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <If is={contact.online}>
                  <OnlineIndicator />
                </If>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate text-[var(--th-text)]"
                >
                  {contact.name}
                </p>
                <p
                  className="text-xs truncate text-[var(--th-text-muted)]"
                >
                  {contact.position ?? ""}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online ? "bg-[var(--th-online)]" : "bg-[var(--th-chip-border)]"}`}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
