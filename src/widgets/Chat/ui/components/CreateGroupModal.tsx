import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, X, Search, Loader2, Check } from "lucide-react";
import { If } from "@shared/ui";
import { useDebouncedCallback } from "@shared/lib";
import { useChatUsers } from "../../api";
import {
  getUserAvatarSource,
  mapUserToContact,
  type IChatLabels,
} from "../../lib/chatMappers";
import { useAuthorizedMedia } from "../../lib/useAuthorizedMedia";
import { Translations } from "../../lib/translations";

// Создание групповой беседы: название, необязательный аватар и участники.
// Уходит multipart-запросом POST /chat/conversations/group.

const SEARCH_DEBOUNCE_MS = 350;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

interface IProps {
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    memberIds: number[];
    avatar: File | null;
  }) => void;
  isCreating: boolean;
  isDark: boolean;
  labels: IChatLabels;
  t: Translations;
}

export const CreateGroupModal = ({
  onClose,
  onCreate,
  isCreating,
  isDark,
  labels,
  t,
}: IProps) => {
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);

  const applySearch = useDebouncedCallback(
    ((value: string) => setQuery(value)) as (...args: unknown[]) => void,
    SEARCH_DEBOUNCE_MS,
  );

  const { users, isLoading } = useChatUsers(query, true);
  const media = useAuthorizedMedia(
    useMemo(() => users.map((user) => getUserAvatarSource(user)), [users]),
  );

  const contacts = useMemo(
    () =>
      users.map((user) =>
        mapUserToContact(user, { currentUserId: null, media, labels }),
      ),
    [users, media, labels],
  );

  const toggleMember = (userId: number) =>
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

  const canCreateGroup = Boolean(title.trim()) && selected.length > 0 && !isCreating;

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
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)] text-[var(--th-text)]"
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-[var(--th-divider)]"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--th-accent-text)]" />
            <h3
              className="font-semibold text-sm text-[var(--th-text)]"
            >
              {t.newGroup}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="px-4 py-3 space-y-2 border-b border-[var(--th-divider)]"
        >
          <input
            autoFocus
            type="text"
            placeholder={t.groupTitlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-3 py-2 outline-none text-sm bg-[var(--th-input-bg)] border border-[var(--th-input-border)] text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
          />
          <label
            className="flex items-center gap-2 text-xs cursor-pointer text-[var(--th-text-muted)]"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                // Бэкенд принимает аватар до 5 МБ — лишний запрос не делаем.
                setAvatar(file && file.size <= MAX_AVATAR_BYTES ? file : null);
              }}
            />
            <span className="underline">{t.groupAvatarLabel}</span>
            <If is={!!avatar}>
              <span className="truncate max-w-[140px]">{avatar?.name}</span>
            </If>
          </label>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 bg-[var(--th-input-bg)] border border-[var(--th-input-border)]"
          >
            <Search
              className="w-4 h-4 flex-shrink-0 text-[var(--th-text-faint)]"
            />
            <input
              type="text"
              placeholder={t.searchContacts}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                applySearch(e.target.value);
              }}
              className="flex-1 bg-transparent outline-none text-sm text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
            />
            <If is={isLoading}>
              <Loader2 className="w-4 h-4 animate-spin text-[var(--th-accent-text)]" />
            </If>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto py-1 compose-modal-scroll">
          <If is={!isLoading && contacts.length === 0}>
            <p
              className="text-center text-xs py-6 text-[var(--th-text-faint)]"
            >
              {t.noContactsFound}
            </p>
          </If>
          {contacts.map((contact) => {
            const userId = contact.peerId as number;
            const isSelected = selected.includes(userId);
            return (
              <button
                key={contact.id}
                onClick={() => toggleMember(userId)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 hover:bg-[var(--th-hover-bg)]"
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
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
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[rgb(var(--th-accent-rgb))] text-[var(--th-on-accent)]" : "bg-[var(--th-chip-bg)]"}`}
                >
                  <If is={isSelected}>
                    <Check className="w-3 h-3" />
                  </If>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--th-divider)]"
        >
          <span className="text-xs text-[var(--th-text-faint)]">
            {selected.length} {t.selectedMembers}
          </span>
          <button
            onClick={() =>
              onCreate({ title: title.trim(), memberIds: selected, avatar })
            }
            disabled={!canCreateGroup}
            className="px-4 py-2 rounded-full text-[var(--th-on-accent)] text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:brightness-110 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))" }}
          >
            <If is={isCreating}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </If>
            {t.createGroup}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
