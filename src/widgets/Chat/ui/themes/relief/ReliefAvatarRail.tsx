import { useMemo } from "react";
import { If } from "@shared/ui";
import type { Contact } from "../../../model";
import type { Translations } from "../../../lib/translations";
import { ReliefAvatar } from "./ReliefAvatar";
import { ReliefCounters } from "./ReliefCounters";
import { RAIL_AVATAR_SIZE } from "./model";

// Панель бесед в горизонтальных макетах: сводка слева, дальше плитки аватарок в
// два ряда с прокруткой вбок. Имя и превью в полосу такой высоты не помещаются,
// поэтому беседа опознаётся аватаркой, а подпись уезжает в подсказку.
//
// Два ряда даёт сетка с потоком по столбцам: плитки заполняют первый столбец
// сверху вниз и переходят к следующему — ровно так они разложены в макете.

interface IProps {
  contacts: Contact[];
  activeContactId: string;
  unreadTotal: number;
  isLoading: boolean;
  t: Translations;
  onContactSwitch: (id: string) => void;
}

/** Сторона плитки беседы (макет: 68px), px. */
const TILE_SIZE = 68;

const GRID_STYLE = {
  display: "grid",
  gridAutoFlow: "column",
  gridTemplateRows: `repeat(2, ${TILE_SIZE}px)`,
  gridAutoColumns: `${TILE_SIZE}px`,
  gap: 10,
} as const;

export const ReliefAvatarRail = ({
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
    <div className="chat-relief-panel chat-relief-panel--sm flex items-center gap-4 p-3 min-w-0 flex-1 overflow-hidden">
      <div className="flex-shrink-0 w-64">
        <ReliefCounters
          chats={contacts.length}
          online={onlineCount}
          unread={unreadTotal}
        />
      </div>

      <div className="chat-relief-scroll flex-1 min-w-0 overflow-x-auto overflow-y-hidden py-1">
        <If is={isLoading && contacts.length === 0}>
          <p className="text-xs py-4 text-[var(--th-text-faint)]">
            {t.loadingChats}
          </p>
        </If>
        <If is={!isLoading && contacts.length === 0}>
          <p className="text-xs py-4 text-[var(--th-text-faint)]">{t.noChats}</p>
        </If>

        <If is={contacts.length > 0}>
          <div style={GRID_STYLE}>
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
                  className="chat-relief-card relative flex items-center justify-center"
                >
                  <ReliefAvatar contact={contact} size={RAIL_AVATAR_SIZE} />

                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 z-20 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{
                        background: "var(--th-badge-unread)",
                        color: "var(--chat-relief-on-color)",
                      }}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </If>
      </div>
    </div>
  );
};
