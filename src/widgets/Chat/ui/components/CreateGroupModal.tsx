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
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.25)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#150e28]/95 border border-white/10 backdrop-blur-xl text-white" : "bg-white border border-gray-200 text-gray-800"}`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-300" />
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {t.newGroup}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-400"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`px-4 py-3 space-y-2 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
        >
          <input
            autoFocus
            type="text"
            placeholder={t.groupTitlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 outline-none text-sm ${isDark ? "bg-white/10 border border-white/15 placeholder-white/30 text-white" : "bg-black/4 border border-black/5 placeholder-gray-400 text-gray-850"}`}
          />
          <label
            className={`flex items-center gap-2 text-xs cursor-pointer ${isDark ? "text-white/50" : "text-gray-500"}`}
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
            className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDark ? "bg-white/10 border border-white/15" : "bg-black/4 border border-black/5"}`}
          >
            <Search
              className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`}
            />
            <input
              type="text"
              placeholder={t.searchContacts}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                applySearch(e.target.value);
              }}
              className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-white/30 text-white" : "placeholder-gray-400 text-gray-850"}`}
            />
            <If is={isLoading}>
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            </If>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto py-1 compose-modal-scroll">
          <If is={!isLoading && contacts.length === 0}>
            <p
              className={`text-center text-xs py-6 ${isDark ? "text-white/40" : "text-gray-400"}`}
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${isDark ? "hover:bg-white/8" : "hover:bg-black/4"}`}
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isDark ? "text-white/90" : "text-gray-900"}`}
                  >
                    {contact.name}
                  </p>
                  <p
                    className={`text-xs truncate ${isDark ? "text-white/40" : "text-gray-500"}`}
                  >
                    {contact.position ?? ""}
                  </p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-violet-500 text-white" : isDark ? "bg-white/10" : "bg-black/5"}`}
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
          className={`flex items-center justify-between gap-3 px-5 py-3 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}
        >
          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
            {selected.length} {t.selectedMembers}
          </span>
          <button
            onClick={() =>
              onCreate({ title: title.trim(), memberIds: selected, avatar })
            }
            disabled={!canCreateGroup}
            className="px-4 py-2 rounded-full text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:brightness-110 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
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
