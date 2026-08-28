import type { ElementType } from "react";
import {
  Maximize2,
  Minimize2,
  MoreVertical,
  Phone,
  Search,
  Video,
  X,
} from "lucide-react";
import { Can } from "@shared/ui";
import type { Contact } from "../../../model";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { Translations } from "../../../lib/translations";
import { ReliefAvatar } from "./ReliefAvatar";
import { ReliefActionButton } from "./ReliefActionButton";
import { toneStyle, type TReliefTone } from "./model";

// Шапка открытой беседы: собеседник слева, быстрые действия над перепиской по
// центру и объёмные круглые действия справа — раскладка макета. Набор функций
// тот же, что и в остальных оформлениях, меняется только вид.

interface IProps {
  activeContact: Contact | null;
  t: Translations;
  showMsgSearch: boolean;
  showContactDrawer: boolean;
  hasPinned: boolean;
  isPinnedShown: boolean;
  hasThreads: boolean;
  onTogglePinned: () => void;
  onOpenThreads: () => void;
  onComposeOpen: () => void;
  onToggleSearch: () => void;
  onToggleDrawer: () => void;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  onRequestClose?: () => void;
}

interface IHeaderAction {
  key: string;
  Icon: ElementType;
  label: string;
  tone: TReliefTone;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const ReliefTopBar = ({
  activeContact,
  t,
  showMsgSearch,
  showContactDrawer,
  hasPinned,
  isPinnedShown,
  hasThreads,
  onTogglePinned,
  onOpenThreads,
  onComposeOpen,
  onToggleSearch,
  onToggleDrawer,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IProps) => {
  const actions: IHeaderAction[] = [
    {
      key: "search",
      Icon: Search,
      label: t.searchMessages,
      tone: "blue",
      onClick: onToggleSearch,
      disabled: !activeContact,
      isActive: showMsgSearch,
    },
    {
      key: "call",
      Icon: Phone,
      label: "Звонки временно недоступны",
      tone: "green",
      disabled: true,
    },
    {
      key: "video",
      Icon: Video,
      label: "Видеозвонки временно недоступны",
      tone: "purple",
      disabled: true,
    },
    {
      key: "info",
      Icon: MoreVertical,
      label: t.contactInfo,
      tone: "orange",
      onClick: onToggleDrawer,
      disabled: !activeContact,
      isActive: showContactDrawer,
    },
  ];

  return (
    <header className="chat-relief-panel flex items-center gap-4 px-6 py-3 min-h-16 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {activeContact && (
          <>
            <ReliefAvatar contact={activeContact} size={40} />
            <span className="min-w-0 flex flex-col gap-0.5">
              <span className="block text-[15px] font-semibold leading-5 truncate text-[var(--th-text)]">
                {activeContact.name}
              </span>
              <span className="flex items-center gap-1 text-xs leading-4 text-[var(--th-text-muted)]">
                {!activeContact.isGroup && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: activeContact.online
                        ? "var(--chat-relief-online)"
                        : "var(--chat-relief-offline)",
                    }}
                  />
                )}
                <span className="truncate">
                  {activeContact.isGroup
                    ? `${activeContact.membersCount ?? 0} ${t.contacts}`
                    : activeContact.online
                      ? t.online
                      : t.lastSeen}
                </span>
              </span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onTogglePinned}
          disabled={!hasPinned}
          aria-pressed={isPinnedShown}
          title={t.pinnedMessage}
          className="chat-relief-tab"
          style={toneStyle("blue")}
        >
          {t.pinned}
        </button>

        <button
          type="button"
          onClick={onOpenThreads}
          disabled={!hasThreads}
          title={t.thread}
          className="chat-relief-tab"
          style={toneStyle("purple")}
        >
          {t.thread}
        </button>

        <Can permission={CHAT_PERMISSIONS.CREATE}>
          <button
            type="button"
            onClick={onComposeOpen}
            aria-label={t.newMessage}
            title={t.newMessage}
            className="chat-relief-tab text-lg font-bold leading-[17px]"
            style={toneStyle("mint")}
          >
            +
          </button>
        </Can>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actions.map(({ key, Icon, label, tone, onClick, disabled, isActive }) => (
          <ReliefActionButton
            key={key}
            Icon={Icon}
            label={label}
            tone={tone}
            onClick={onClick}
            disabled={disabled}
            isActive={isActive}
            size={40}
          />
        ))}

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={
              isExpanded ? "Свернуть чат в окно" : "Развернуть чат на весь экран"
            }
            className="chat-relief-ghost w-9 h-9"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Закрыть чат"
            className="chat-relief-ghost w-9 h-9"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
