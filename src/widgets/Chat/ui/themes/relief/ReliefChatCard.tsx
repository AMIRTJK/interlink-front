import { BellOff } from "lucide-react";
import type { Contact } from "../../../model";
import type { Lang, Translations } from "../../../lib/translations";
import { formatConversationTime } from "../../../lib/chatFormat";
import { FavoriteToggleButton } from "../../components/FavoriteToggleButton";
import { ReliefAvatar } from "./ReliefAvatar";
import { AVATAR_SIZE } from "./model";

// Карточка беседы в списке: аватарка, имя, время последнего сообщения и превью.
// Открытая беседа отличается сиреневой заливкой и более заметной каймой —
// состояния строятся в CSS (.chat-relief-card), здесь только содержимое.
// Звёздочка «В избранное» — отдельная кнопка в своей колонке справа (pr-11 у
// карточки), чтобы не наезжать на время и счётчик непрочитанных.

interface IProps {
  contact: Contact;
  isActive: boolean;
  lang: Lang;
  t: Translations;
  onSelect: (id: string) => void;
  onToggleFavorite: (contact: Contact) => void;
}

export const ReliefChatCard = ({
  contact,
  isActive,
  lang,
  t,
  onSelect,
  onToggleFavorite,
}: IProps) => {
  const unread = contact.unreadCount ?? 0;
  const time = formatConversationTime(contact.lastMessageAt, lang, t);
  // Прочитанная беседа в макете написана серым целиком — так непрочитанные
  // читаются с одного взгляда.
  const isDimmed = unread === 0 && !isActive;

  return (
    <div className="relative group/row">
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      aria-current={isActive}
      className="chat-relief-card w-full flex items-center gap-3 pl-3 pr-11 py-3 text-left"
    >
      <ReliefAvatar contact={contact} size={AVATAR_SIZE} />

      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-bold leading-[18px] truncate ${
              isDimmed ? "text-[var(--th-text-faint)]" : "text-[var(--th-text)]"
            }`}
          >
            {contact.name}
          </span>

          <span className="flex items-center gap-1 flex-shrink-0">
            {contact.isMuted && (
              <BellOff
                className="w-3 h-3 text-[var(--th-text-faint)]"
                aria-label={t.mute}
              />
            )}
            {!!time && (
              <span
                className={`text-[11px] leading-[14px] ${
                  isDimmed
                    ? "text-[var(--th-text-faint)]"
                    : "text-[var(--th-text-muted)]"
                }`}
              >
                {time}
              </span>
            )}
          </span>
        </span>

        <span className="flex items-center justify-between gap-2">
          <span
            className={`text-[13px] leading-[17px] truncate ${
              isDimmed ? "text-[var(--th-text-faint)]" : "text-[var(--th-text-muted)]"
            }`}
          >
            {contact.lastMessage}
          </span>

          {unread > 0 && (
            <span
              className="min-w-5 h-5 px-1.5 rounded-[10px] text-[10px] font-bold leading-none flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--th-badge-unread)",
                color: "var(--chat-relief-on-color)",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </span>
    </button>
    <FavoriteToggleButton
      isStarred={Boolean(contact.isStarred)}
      addLabel={t.addToFavorites}
      removeLabel={t.removeFromFavorites}
      onToggle={() => onToggleFavorite(contact)}
      className="absolute right-2 top-1/2 -translate-y-1/2"
    />
    </div>
  );
};
