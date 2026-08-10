import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Video, Bell, Star, X, Grid3X3, Mail, MapPin, Calendar, Search, ChevronRight, Shield, Trash } from "lucide-react";
import {
  Contact,
  DrawerTab,
  IChatMember,
  TChatMemberRole,
} from "../../model";
import { Translations } from "../../lib/translations";
import { buildInitialsAvatar } from "../../lib/chatFormat";
import { getChatAvatarClipPath } from "../../lib/chatAvatarShape";
import type { IChatLabels } from "../../lib/chatMappers";
import { ConversationMediaTab } from "./ConversationMediaTab";
import { GroupMembersPanel } from "./GroupMembersPanel";

interface ContactInfoDrawerProps {
  contact: Contact;
  conversationId: number | null;
  members: IChatMember[];
  currentUserId: number | null;
  onClose: () => void;
  onDeleteConversation: () => void;
  /** Избранное и «не беспокоить» — PATCH /conversations/{id}/settings. */
  onToggleStar: () => void;
  onToggleMute: () => void;
  onAddMembers: (userIds: number[]) => void;
  onRemoveMember: (userId: number) => void;
  onChangeMemberRole: (userId: number, role: TChatMemberRole) => void;
  isDark: boolean;
  labels: IChatLabels;
  t: Translations;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  contact,
  conversationId,
  members,
  currentUserId,
  onClose,
  onDeleteConversation,
  onToggleStar,
  onToggleMute,
  onAddMembers,
  onRemoveMember,
  onChangeMemberRole,
  isDark,
  labels,
  t,
}) => {
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("info");

  // Форма аватарки группы = число участников; внутренняя обводка на фигуре
  // распадается на куски, поэтому в этом случае остаётся только форма.
  const clipPath = getChatAvatarClipPath(contact);

  const quickActions = [
    { icon: <Phone className="w-4 h-4" />, label: t.call, onClick: undefined },
    { icon: <Video className="w-4 h-4" />, label: t.video, onClick: undefined },
    {
      icon: <Bell className="w-4 h-4" />,
      label: t.mute,
      onClick: onToggleMute,
      isActive: contact.isMuted,
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: t.star,
      onClick: onToggleStar,
      isActive: contact.isStarred,
    },
  ];

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-72 flex-shrink-0 border-l flex flex-col overflow-hidden border-[var(--th-divider)]"
      style={{
        background: "var(--th-sidebar-bg)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0 border-[var(--th-divider)]">
        <h3 className="font-semibold text-sm text-[var(--th-text)]">
          {t.contactInfo}
        </h3>
        <button
          onClick={onClose}
          aria-label="Закрыть карточку контакта"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex border-b flex-shrink-0 border-[var(--th-divider)]"
      >
        <button
          onClick={() => setDrawerTab("info")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 ${drawerTab === "info" ? "border-[rgb(var(--th-accent-rgb))] text-[var(--th-accent-text)]" : "border-transparent text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"}`}
        >
          {t.info}
        </button>
        <button
          onClick={() => setDrawerTab("media")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 flex items-center justify-center gap-1.5 ${drawerTab === "media" ? "border-[rgb(var(--th-accent-rgb))] text-[var(--th-accent-text)]" : "border-transparent text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"}`}
        >
          <Grid3X3 className="w-3 h-3" />
          <span>{t.media}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {drawerTab === "info" && (
          <div>
            <div
              className="flex flex-col items-center px-5 pt-6 pb-4"
              style={{
                background:
                  "linear-gradient(180deg, var(--th-accent-soft), transparent)",
              }}
            >
              <div className="relative mb-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      buildInitialsAvatar(contact.name);
                  }}
                  className={`w-20 h-20 object-cover shadow-md overflow-hidden ${clipPath ? "" : "rounded-full"}`}
                  style={
                    clipPath
                      ? { clipPath }
                      : {
                          boxShadow:
                            "inset 0 0 0 3px rgb(var(--th-accent-rgb) / 0.6)",
                        }
                  }
                />
                {contact.online && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[var(--th-online)] border-2 border-[var(--th-panel-border)] rounded-full" />
                )}
              </div>
              <h2 className="font-bold text-lg leading-tight text-center text-[var(--th-text)]">
                {contact.name}
              </h2>
              <p className="text-xs mt-0.5 text-[var(--th-text-muted)]">
                {contact.isGroup
                  ? `${contact.membersCount ?? 0} ${t.contacts}`
                  : contact.online
                    ? t.online
                    : t.lastSeen}
              </p>
              {contact.position && (
                <p className="text-xs text-center mt-1 text-[var(--th-text-muted)]">
                  {contact.position}
                </p>
              )}
              {contact.bio && (
                <p className="text-xs text-center mt-2 leading-relaxed px-2 text-[var(--th-text-muted)]">
                  {contact.bio}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                {quickActions.map((action) => {
                  const isDisabled = !action.onClick;
                  return (
                    <button
                      key={action.label}
                      disabled={isDisabled}
                      onClick={action.onClick}
                      aria-label={action.label}
                      aria-pressed={action.isActive}
                      title={isDisabled ? "Звонки временно недоступны" : undefined}
                      className={`flex flex-col items-center gap-1 group ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${isDisabled ? "" : "group-hover:scale-110"} ${action.isActive ? "text-[var(--th-on-accent)]" : "text-[var(--th-accent-text)]"}`}
                        style={{
                          background: action.isActive
                            ? "linear-gradient(135deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-3-rgb)))"
                            : "var(--th-accent-soft)",
                          border: "1px solid var(--th-accent-border)",
                        }}
                      >
                        {action.icon}
                      </div>
                      <span className="text-[10px] text-[var(--th-text-faint)]">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3 space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--th-chip-bg)] text-[var(--th-text-faint)]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-wider text-[var(--th-text-faint)]"
                    >
                      {t.email}
                    </p>
                    <p
                      className="text-xs font-medium truncate text-[var(--th-text-muted)]"
                    >
                      {contact.email}
                    </p>
                  </div>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--th-chip-bg)] text-[var(--th-text-faint)]"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider text-[var(--th-text-faint)]"
                    >
                      {t.location}
                    </p>
                    <p
                      className="text-xs font-medium text-[var(--th-text-muted)]"
                    >
                      {contact.location}
                    </p>
                  </div>
                </div>
              )}
              {contact.joined && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--th-chip-bg)] text-[var(--th-text-faint)]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider text-[var(--th-text-faint)]"
                    >
                      {t.memberSince}
                    </p>
                    <p
                      className="text-xs font-medium text-[var(--th-text-muted)]"
                    >
                      {contact.joined}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="mx-5 border-t my-1 border-[var(--th-divider)]"
            />

            {contact.isGroup && (
              <GroupMembersPanel
                members={members}
                myRole={contact.myRole}
                currentUserId={currentUserId}
                isDark={isDark}
                t={t}
                onAddMembers={onAddMembers}
                onRemoveMember={onRemoveMember}
                onChangeRole={onChangeMemberRole}
              />
            )}

            {contact.mutualGroups && contact.mutualGroups.length > 0 && (
              <div className="px-5 py-3">
                <p
                  className="text-[10px] uppercase tracking-wider mb-2 text-[var(--th-text-faint)]"
                >
                  {t.mutualGroups}
                </p>
                <div className="space-y-1">
                  {contact.mutualGroups.map((group) => (
                    <button
                      key={group}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group hover:bg-[var(--th-hover-bg)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--th-accent-text)] bg-[var(--th-accent-soft-strong)]">
                          <Search className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-[var(--th-text-muted)]">
                          {group}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 transition-colors duration-200 text-[var(--th-text-faint)] group-hover:text-[var(--th-accent-text)]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className="mx-5 border-t my-1 border-[var(--th-divider)]"
            />

            <div className="px-5 py-3 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ease-in-out hover:bg-[var(--th-hover-bg)] text-[var(--th-text-muted)]">
                <Shield className="w-4 h-4 text-[var(--th-text-faint)]" />
                <span className="text-xs">{t.blockContact}</span>
              </button>
              <button
                onClick={onDeleteConversation}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[rgb(var(--th-danger-rgb)/0.15)] text-[rgb(var(--th-danger-rgb))] transition-all duration-200 ease-in-out"
              >
                <Trash className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {t.deleteConversation}
                </span>
              </button>
            </div>
          </div>
        )}

        {drawerTab === "media" && (
          <ConversationMediaTab
            conversationId={conversationId}
            isDark={isDark}
            labels={labels}
            t={t}
          />
        )}
      </div>
    </motion.div>
  );
};
