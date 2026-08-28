import { useMemo } from "react";
import { If } from "@shared/ui";
import type { Contact } from "../../../model";
import type { Lang, Translations } from "../../../lib/translations";
import { ReliefCounters } from "./ReliefCounters";
import { ReliefChatCard } from "./ReliefChatCard";

// Список бесед в вертикальных макетах: сводка сверху, открытая беседа отдельной
// карточкой и все остальные под заголовком раздела — как в макете.

interface IProps {
  contacts: Contact[];
  activeContactId: string;
  unreadTotal: number;
  isLoading: boolean;
  lang: Lang;
  t: Translations;
  onContactSwitch: (id: string) => void;
}

export const ReliefChatList = ({
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
    <div className="chat-relief-panel chat-relief-panel--sm flex-1 min-h-0 flex flex-col gap-3 p-3 overflow-hidden">
      <ReliefCounters
        chats={contacts.length}
        online={onlineCount}
        unread={unreadTotal}
      />

      <div className="chat-relief-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-2.5 pr-1">
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
          <ReliefChatCard
            contact={activeContact}
            isActive
            lang={lang}
            t={t}
            onSelect={onContactSwitch}
          />
        )}

        <If is={restContacts.length > 0}>
          <p className="px-2 pt-1 text-[11px] font-semibold leading-[13px] text-[var(--th-text-faint)]">
            {`💬 ${t.allChats}`}
          </p>
        </If>

        {restContacts.map((contact) => (
          <ReliefChatCard
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
