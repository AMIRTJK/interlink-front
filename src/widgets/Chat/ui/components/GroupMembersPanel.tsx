import { useMemo, useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { Can, If } from "@shared/ui";
import { useDebouncedCallback } from "@shared/lib";
import type { IChatMember, TChatMemberRole } from "../../model";
import { CHAT_PERMISSIONS, CHAT_ROLE_LABELS } from "../../model/constants";
import { useChatUsers } from "../../api";
import { getUserAvatarSource } from "../../lib/chatMappers";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import { useAuthorizedMedia } from "../../lib/useAuthorizedMedia";
import { Translations } from "../../lib/translations";
import { RoleSelect } from "./RoleSelect";

// Состав групповой беседы: роли, удаление и добавление участников.
// Действия доступны владельцу и администраторам (право chat.group.manage),
// итоговую проверку прав делает бэкенд.

const SEARCH_DEBOUNCE_MS = 350;

interface IProps {
  members: IChatMember[];
  myRole?: TChatMemberRole;
  currentUserId: number | null;
  isDark: boolean;
  t: Translations;
  onAddMembers: (userIds: number[]) => void;
  onRemoveMember: (userId: number) => void;
  onChangeRole: (userId: number, role: TChatMemberRole) => void;
}

export const GroupMembersPanel = ({
  members,
  myRole,
  currentUserId,
  isDark,
  t,
  onAddMembers,
  onRemoveMember,
  onChangeRole,
}: IProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const applySearch = useDebouncedCallback(
    ((value: string) => setQuery(value)) as (...args: unknown[]) => void,
    SEARCH_DEBOUNCE_MS,
  );

  const canManage = myRole === "owner" || myRole === "admin";

  const { users, isLoading } = useChatUsers(query, isAdding);
  const memberIds = useMemo(
    () => new Set(members.map((member) => member.id)),
    [members],
  );
  const candidates = users.filter((user) => !memberIds.has(user.id));

  const media = useAuthorizedMedia(
    useMemo(
      () => [...members, ...candidates].map((user) => getUserAvatarSource(user)),
      [members, candidates],
    ),
  );

  // ФИО может не прийти — тогда участник всё равно должен отрисоваться.
  const nameOf = (user: IChatMember) => user.full_name ?? `#${user.id}`;

  const avatarOf = (user: IChatMember) => {
    const source = getUserAvatarSource(user);
    return (source && media[source]) || buildInitialsAvatar(user.full_name);
  };

  return (
    <div className="px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[10px] uppercase tracking-wider text-[var(--th-text-faint)]"
        >
          {t.contacts} · {members.length}
        </p>
        <Can permission={CHAT_PERMISSIONS.GROUP_MANAGE}>
          <If is={canManage}>
            <button
              onClick={() => setIsAdding((v) => !v)}
              aria-label={t.add}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-[var(--th-accent-text)] bg-[var(--th-chip-bg)]"
            >
              <UserPlus className="w-3 h-3" />
            </button>
          </If>
        </Can>
      </div>

      <If is={isAdding}>
        <div className="mb-3">
          <input
            autoFocus
            type="text"
            placeholder={t.searchContacts}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applySearch(e.target.value);
            }}
            className="w-full rounded-xl px-3 py-2 outline-none text-xs bg-[var(--th-input-bg)] border border-[var(--th-input-border)] text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
          />
          <If is={isLoading}>
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--th-accent-text)]" />
            </div>
          </If>
          <div className="max-h-40 overflow-y-auto mt-1 space-y-1">
            {candidates.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onAddMembers([user.id]);
                  setIsAdding(false);
                  setSearch("");
                  setQuery("");
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-200 hover:bg-[var(--th-hover-bg)]"
              >
                <img
                  src={avatarOf(user)}
                  alt={nameOf(user)}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <span
                  className="text-xs truncate text-[var(--th-text-muted)]"
                >
                  {nameOf(user)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </If>

      <div className="space-y-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--th-hover-bg)]"
          >
            <img
              src={avatarOf(member)}
              alt={nameOf(member)}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0 overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px var(--th-accent-border)" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate text-[var(--th-text)]"
              >
                {nameOf(member)}
              </p>
              <p
                className="text-[10px] text-[var(--th-text-faint)]"
              >
                {CHAT_ROLE_LABELS[member.role ?? "member"]}
              </p>
            </div>
            <If is={canManage && member.id !== currentUserId}>
              <RoleSelect
                value={member.role ?? "member"}
                onChange={(role) => onChangeRole(member.id, role)}
                isDark={isDark}
                memberName={nameOf(member)}
              />
              <button
                onClick={() => onRemoveMember(member.id)}
                aria-label={`Удалить участника ${nameOf(member)}`}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[rgb(var(--th-danger-rgb))] hover:bg-[rgb(var(--th-danger-rgb)/0.15)] transition-all duration-200"
              >
                <X className="w-3 h-3" />
              </button>
            </If>
          </div>
        ))}
      </div>
    </div>
  );
};
