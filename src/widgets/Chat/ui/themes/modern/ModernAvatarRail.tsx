import { useMemo } from "react";
import { If } from "@shared/ui";
import type { Contact } from "../../../model";
import type { Translations } from "../../../lib/translations";
import { buildInitialsAvatar } from "../../../lib/chatFormat";
import { OnlineIndicator } from "../../components/OnlineIndicator";
import { ModernCounters } from "./ModernCounters";

// Панель бесед в горизонтальных макетах: сводка и плитки аватарок. Имя и превью
// в полосу высотой в две строки не помещаются, поэтому беседа опознаётся
// аватаркой, а подпись уезжает в подсказку.

interface IProps {
  contacts: Contact[];
  activeContactId: string;
  unreadTotal: number;
  isLoading: boolean;
  t: Translations;
  onContactSwitch: (id: string) => void;
}

export const ModernAvatarRail = ({
  contacts,
  activeContactId,
  unreadTotal,
  isLoading,
  t,
  onContactSwitch,
}: IProps) => {
  const onlineCount = useMemo(
    () => contacts.filter((contact) => contact.online).length,
    [contacts],
  );

  return (
    <div className="chat-modern-card flex items-start gap-3 p-3 min-w-0 flex-1 overflow-hidden">
      <div className="flex-shrink-0 w-56">
        <ModernCounters
          chats={contacts.length}
          online={onlineCount}
          unread={unreadTotal}
        />
      </div>

      <div
        className="flex-1 min-w-0 flex flex-wrap gap-2 overflow-y-auto max-h-[132px] content-start"
        style={{ scrollbarWidth: "thin" }}
      >
        <If is={isLoading && contacts.length === 0}>
          <p className="text-xs py-4 text-[var(--th-text-faint)]">
            {t.loadingChats}
          </p>
        </If>
        <If is={!isLoading && contacts.length === 0}>
          <p className="text-xs py-4 text-[var(--th-text-faint)]">{t.noChats}</p>
        </If>

        {contacts.map((contact) => {
          const isActive = contact.id === activeContactId;
          const unread = contact.unreadCount ?? 0;
          return (
            <button
              key={contact.id}
              type="button"
              onClick={() => onContactSwitch(contact.id)}
              aria-label={contact.name}
              aria-current={isActive}
              title={contact.name}
              className="relative flex-shrink-0 p-1.5 rounded-2xl transition-transform duration-200 hover:scale-105"
              style={
                isActive
                  ? { background: "var(--chat-modern-active)" }
                  : {
                      background: "var(--chat-modern-card)",
                      boxShadow: "var(--th-shadow-soft)",
                    }
              }
            >
              <span className="relative block">
                <img
                  src={contact.avatar}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      buildInitialsAvatar(contact.name);
                  }}
                  className="w-11 h-11 object-cover overflow-hidden rounded-full"
                />
                {contact.online && (
                  <OnlineIndicator className="absolute bottom-0 right-0 z-20" />
                )}
                {unread > 0 && (
                  <span
                    className="absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{
                      background: "var(--th-badge-unread)",
                      color: "var(--chat-modern-on-color)",
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
};
