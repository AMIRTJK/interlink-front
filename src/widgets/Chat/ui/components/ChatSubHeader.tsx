import { motion } from "framer-motion";
import { Search, Phone, Video, UserCog } from "lucide-react";
import type { Contact } from "../../model";
import { Translations } from "../../lib/translations";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import { getChatAvatarClipPath } from "../../lib/chatAvatarShape";

// Шапка открытой беседы: собеседник, его статус и действия над беседой.

interface IProps {
  activeContact: Contact;
  isDark: boolean;
  t: Translations;
  showMsgSearch: boolean;
  showContactDrawer: boolean;
  onToggleSearch: () => void;
  onToggleDrawer: () => void;
  onStartCall: (type: "audio" | "video") => void;
  onSimulateIncomingCall: () => void;
}

export const ChatSubHeader = ({
  activeContact,
  isDark,
  t,
  showMsgSearch,
  showContactDrawer,
  onToggleSearch,
  onToggleDrawer,
  onStartCall,
  onSimulateIncomingCall,
}: IProps) => {
  // Форма аватарки группы = число участников; внутренняя обводка на фигуре
  // распадается на куски, поэтому в этом случае остаётся только форма.
  const clipPath = getChatAvatarClipPath(activeContact);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0 border-[var(--th-divider)]"
      style={{
        background: "var(--th-composer-bg)",
        backdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        key={`header-${activeContact.id}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <img
            src={activeContact.avatar}
            alt={activeContact.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = buildInitialsAvatar(
                activeContact.name,
              );
            }}
            className={`w-10 h-10 object-cover overflow-hidden ${clipPath ? "" : "rounded-full"}`}
            style={
              clipPath
                ? { clipPath }
                : { boxShadow: "inset 0 0 0 2px var(--th-accent-border)" }
            }
          />
          {activeContact.online && (
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--th-online)] border-2 border-transparent rounded-full"
              style={{ boxShadow: "var(--th-online-glow)" }}
            />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-sm text-[var(--th-text)]">
            {activeContact.name}
          </h2>
          <p className="text-xs text-[var(--th-text-muted)]">
            {activeContact.isGroup
              ? `${activeContact.membersCount ?? 0} ${t.contacts}`
              : activeContact.online
                ? t.online
                : t.lastSeen}
          </p>
        </div>
      </motion.div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSearch}
          aria-label={t.searchMessages}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showMsgSearch ? "bg-[var(--th-selected-bg)] text-[var(--th-accent-text)]" : "text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"}`}
        >
          <Search className="w-4.5 h-4.5" />
        </button>
        <button
          disabled
          aria-label={t.simulateCall}
          title="Звонки временно недоступны"
          className="w-9 h-9 rounded-full flex items-center justify-center opacity-40 cursor-not-allowed text-[var(--th-text-faint)]"
        >
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button
          disabled
          aria-label={t.videoCall}
          title="Видеозвонки временно недоступны"
          className="w-9 h-9 rounded-full flex items-center justify-center opacity-40 cursor-not-allowed text-[var(--th-text-faint)]"
        >
          <Video className="w-4.5 h-4.5" />
        </button>
        <button
          disabled
          aria-label={t.audioCall}
          title="Аудиозвонки временно недоступны"
          className="w-9 h-9 rounded-full flex items-center justify-center opacity-40 cursor-not-allowed text-[var(--th-text-faint)]"
        >
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={onToggleDrawer}
          aria-label={t.contactInfo}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showContactDrawer ? "bg-[var(--th-selected-bg)] text-[var(--th-accent-text)]" : "text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"}`}
        >
          <UserCog className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
