import { useMemo } from "react";
import { MessagesSquare } from "lucide-react";
import { If } from "@shared/ui";
import type { Contact } from "../../../model";
import type { Lang, Translations } from "../../../lib/translations";
import { ModernCounters } from "./ModernCounters";
import { ModernChatCard } from "./ModernChatCard";

// Список бесед в вертикальных макетах: сводка сверху, открытая беседа отдельной
// плиткой и все остальные под заголовком раздела.

interface IProps {
  contacts: Contact[];
  activeContactId: string;
  unreadTotal: number;
  isLoading: boolean;
  lang: Lang;
  t: Translations;
  onContactSwitch: (id: string) => void;
}

export const ModernChatList = ({
  contacts,
  activeContactId,
  unreadTotal,
  isLoading,
  lang,
  t,
  onContactSwitch,
}: IProps) => {
  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeContactId) ?? null,
    [contacts, activeContactId],
  );

  const restContacts = useMemo(
    () => contacts.filter((contact) => contact.id !== activeContactId),
    [contacts, activeContactId],
  );

  const onlineCount = useMemo(
    () => contacts.filter((contact) => contact.online).length,
    [contacts],
  );

  return (
    <div className="chat-modern-card flex-1 min-h-0 flex flex-col gap-2 p-3 overflow-hidden">
      <ModernCounters
        chats={contacts.length}
        online={onlineCount}
        unread={unreadTotal}
      />

      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-2 pr-0.5"
        style={{ scrollbarWidth: "thin" }}
      >
        <If is={isLoading && contacts.length === 0}>
          <p className="text-center text-xs py-6 text-[var(--th-text-faint)]">
            {t.loadingChats}
          </p>
        </If>
        <If is={!isLoading && contacts.length === 0}>
          <p className="text-center text-xs py-6 text-[var(--th-text-faint)]">
            {t.noChats}
          </p>
        </If>

        {activeContact && (
          <ModernChatCard
            contact={activeContact}
            isActive
            lang={lang}
            t={t}
            onSelect={onContactSwitch}
          />
        )}

        <If is={restContacts.length > 0}>
          <p className="flex items-center gap-1.5 px-1 pt-1 text-[11px] font-semibold text-[var(--th-text-faint)]">
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>{t.allChats}</span>
          </p>
        </If>

        {restContacts.map((contact) => (
          <ModernChatCard
            key={contact.id}
            contact={contact}
            isActive={false}
            lang={lang}
            t={t}
            onSelect={onContactSwitch}
          />
        ))}
      </div>
    </div>
  );
};
