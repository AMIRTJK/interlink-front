import React from "react";
import { motion } from "framer-motion";
import { Forward, X } from "lucide-react";
import { Contact, Message } from "../../model";
import { Translations } from "../../lib/translations";
import { OnlineIndicator } from "./OnlineIndicator";

interface ForwardModalProps {
  message: Message;
  /** Беседы, доступные для пересылки, — тот же реестр, что и в списке чатов. */
  contacts: Contact[];
  isDark: boolean;
  t: Translations;
  onForwardSend: (targetContactId: string) => void;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  message,
  contacts,
  isDark,
  t,
  onForwardSend,
  onClose,
}) => (
  <motion.div
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      background: "var(--th-scrim)",
      backdropFilter: "blur(20px)",
    }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)] text-[var(--th-text)]"
      style={{ boxShadow: "0 20px 60px rgb(var(--th-accent-rgb) / 0.25)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-[var(--th-divider)]"
      >
        <div className="flex items-center gap-2">
          <Forward className="w-4 h-4 text-[var(--th-accent-text)]" />
          <h3
            className="font-semibold text-sm text-[var(--th-text)]"
          >
            {t.forwardMessage}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        className="px-5 py-3 border-b border-[var(--th-divider)] bg-[var(--th-chip-bg)]"
      >
        <p
          className="text-xs line-clamp-2 italic text-[var(--th-text-muted)]"
        >
          "{message.text}"
        </p>
      </div>
      <div className="max-h-64 overflow-y-auto py-2 compose-modal-scroll">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onForwardSend(contact.id)}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out text-left group hover:bg-[var(--th-hover-bg)]"
          >
            <div className="relative flex-shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {contact.online && <OnlineIndicator />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate text-[var(--th-text)]"
              >
                {contact.name}
              </p>
              <p
                className="text-xs truncate text-[var(--th-text-muted)]"
              >
                {contact.lastMessage}
              </p>
            </div>
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online ? "bg-[var(--th-online)]" : "bg-[var(--th-chip-border)]"}`}
            />
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);
