import type { Contact } from "../../../model";
import type { Lang, Translations } from "../../../lib/translations";
import {
  buildInitialsAvatar,
  formatConversationTime,
} from "../../../lib/chatFormat";
import { OnlineIndicator } from "../../components/OnlineIndicator";

// Карточка беседы в списке современного оформления: аватар, имя, время и
// превью последнего сообщения. Открытая беседа отличается заливкой, а не
// полосой у края, — карточки лежат на фоне отдельными плитками.

interface IProps {
  contact: Contact;
  isActive: boolean;
  lang: Lang;
  t: Translations;
  onSelect: (id: string) => void;
}

export const ModernChatCard = ({
  contact,
  isActive,
  lang,
  t,
  onSelect,
}: IProps) => {
  const unread = contact.unreadCount ?? 0;
  const time = formatConversationTime(contact.lastMessageAt, lang, t);

  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      aria-current={isActive}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors duration-200"
      style={
        isActive
          ? { background: "var(--chat-modern-active)" }
          : {
              background: "var(--chat-modern-card)",
              boxShadow: "var(--th-shadow-soft)",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--chat-modern-soft)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--chat-modern-card)";
      }}
    >
      <span className="relative flex-shrink-0">
        <img
          src={contact.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = buildInitialsAvatar(
              contact.name,
            );
          }}
          className="w-10 h-10 object-cover overflow-hidden rounded-full"
        />
        {contact.online && <OnlineIndicator className="absolute bottom-0 right-0 z-20" />}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span
            className={`text-sm truncate ${
              unread > 0 || isActive
                ? "font-bold text-[var(--th-text)]"
                : "font-semibold text-[var(--th-text-muted)]"
            }`}
          >
            {contact.name}
          </span>
          {!!time && (
            <span className="text-[11px] flex-shrink-0 text-[var(--th-text-faint)]">
              {time}
            </span>
          )}
        </span>
        <span className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs truncate text-[var(--th-text-faint)]">
            {contact.lastMessage}
          </span>
          {unread > 0 && (
            <span
              className="min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--th-badge-unread)",
                color: "var(--chat-modern-on-color)",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};
