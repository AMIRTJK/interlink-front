import type { ElementType } from "react";
import {
  Maximize2,
  MessagesSquare,
  Minimize2,
  MoreVertical,
  Phone,
  Pin,
  Plus,
  Search,
  Video,
  X,
} from "lucide-react";
import { Can } from "@shared/ui";
import type { Contact } from "../../../model";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { Translations } from "../../../lib/translations";
import { buildInitialsAvatar } from "../../../lib/chatFormat";
import { OnlineIndicator } from "../../components/OnlineIndicator";

// Шапка открытой беседы: собеседник слева, быстрые действия над перепиской по
// центру и действия над окном справа. Всё те же функции, что и в классическом
// оформлении, — меняется только их вид и расположение.

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

const PILL_CLASS =
  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

const ACTION_CLASS = "chat-modern-action w-9 h-9";

interface IWindowAction {
  key: string;
  Icon: ElementType;
  label: string;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const ModernTopBar = ({
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
  const actions: IWindowAction[] = [
    {
      key: "search",
      Icon: Search,
      label: t.searchMessages,
      color: "var(--chat-modern-blue)",
      onClick: onToggleSearch,
      disabled: !activeContact,
      isActive: showMsgSearch,
    },
    {
      key: "call",
      Icon: Phone,
      label: "Звонки временно недоступны",
      color: "var(--chat-modern-green)",
      disabled: true,
    },
    {
      key: "video",
      Icon: Video,
      label: "Видеозвонки временно недоступны",
      color: "var(--chat-modern-purple)",
      disabled: true,
    },
    {
      key: "info",
      Icon: MoreVertical,
      label: t.contactInfo,
      color: "var(--chat-modern-orange)",
      onClick: onToggleDrawer,
      disabled: !activeContact,
      isActive: showContactDrawer,
    },
  ];

  return (
    <header className="chat-modern-card flex items-center gap-3 px-4 py-2.5 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {activeContact && (
          <>
            <span className="relative flex-shrink-0">
              <img
                src={activeContact.avatar}
                alt=""
                width={40}
                height={40}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    buildInitialsAvatar(activeContact.name);
                }}
                className="w-10 h-10 object-cover overflow-hidden rounded-full"
              />
              {activeContact.online && (
                <OnlineIndicator className="absolute bottom-0 right-0 z-20" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold truncate text-[var(--th-text)]">
                {activeContact.name}
              </span>
              <span className="block text-[11px] truncate text-[var(--th-text-muted)]">
                {activeContact.isGroup
                  ? `${activeContact.membersCount ?? 0} ${t.contacts}`
                  : activeContact.online
                    ? t.online
                    : t.lastSeen}
              </span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onTogglePinned}
          disabled={!hasPinned}
          aria-pressed={isPinnedShown}
          title={t.pinnedMessage}
          className={PILL_CLASS}
          style={{
            background: isPinnedShown
              ? "var(--chat-modern-blue)"
              : "var(--chat-modern-soft)",
            color: isPinnedShown
              ? "var(--chat-modern-on-color)"
              : "var(--th-text-muted)",
          }}
        >
          <Pin className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          {t.pinned}
        </button>

        <button
          type="button"
          onClick={onOpenThreads}
          disabled={!hasThreads}
          title={t.thread}
          className={PILL_CLASS}
          style={{
            background: "var(--chat-modern-purple)",
            color: "var(--chat-modern-on-color)",
          }}
        >
          <MessagesSquare className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          {t.thread}
        </button>

        <Can permission={CHAT_PERMISSIONS.CREATE}>
          <button
            type="button"
            onClick={onComposeOpen}
            aria-label={t.newMessage}
            title={t.newMessage}
            className={`${PILL_CLASS} flex items-center`}
            style={{
              background: "var(--chat-modern-green)",
              color: "var(--chat-modern-on-color)",
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </Can>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
        {actions.map(({ key, Icon, label, color, onClick, disabled, isActive }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className={ACTION_CLASS}
            style={{
              background: color,
              outline: isActive ? "2px solid var(--th-text-faint)" : undefined,
              outlineOffset: isActive ? "2px" : undefined,
            }}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={
              isExpanded ? "Свернуть чат в окно" : "Развернуть чат на весь экран"
            }
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"
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
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
