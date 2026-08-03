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
      className={`w-72 flex-shrink-0 border-l flex flex-col overflow-hidden ${isDark ? "border-white/10" : "border-black/5"}`}
      style={{
        background: isDark ? "rgba(15,5,40,0.65)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <h3
          className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {t.contactInfo}
        </h3>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`flex border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-black/5"}`}
      >
        <button
          onClick={() => setDrawerTab("info")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 ${drawerTab === "info" ? (isDark ? "border-violet-400 text-violet-300" : "border-violet-600 text-violet-600") : isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-650"}`}
        >
          {t.info}
        </button>
        <button
          onClick={() => setDrawerTab("media")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-200 ease-in-out border-b-2 flex items-center justify-center gap-1.5 ${drawerTab === "media" ? (isDark ? "border-violet-400 text-violet-300" : "border-violet-600 text-violet-600") : isDark ? "border-transparent text-white/40 hover:text-white/70" : "border-transparent text-gray-400 hover:text-gray-650"}`}
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
                background: isDark
                  ? "linear-gradient(180deg,rgba(124,58,237,0.2),transparent)"
                  : "linear-gradient(180deg,rgba(124,58,237,0.06),transparent)",
              }}
            >
              <div className="relative mb-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-20 h-20 rounded-full object-cover border-4 shadow-md"
                  style={{ borderColor: "rgba(167,139,250,0.5)" }}
                />
                {contact.online && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white/20 rounded-full" />
                )}
              </div>
              <h2
                className={`font-bold text-lg leading-tight text-center ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {contact.name}
              </h2>
              <p
                className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}
              >
                {contact.isGroup
                  ? `${contact.membersCount ?? 0} ${t.contacts}`
                  : contact.online
                    ? t.online
                    : t.lastSeen}
              </p>
              {contact.position && (
                <p
                  className={`text-xs text-center mt-1 ${isDark ? "text-white/45" : "text-gray-500"}`}
                >
                  {contact.position}
                </p>
              )}
              {contact.bio && (
                <p
                  className={`text-xs text-center mt-2 leading-relaxed px-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
                >
                  {contact.bio}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    aria-label={action.label}
                    aria-pressed={action.isActive}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out group-hover:scale-110 ${action.isActive ? "text-white" : isDark ? "text-violet-300 group-hover:text-white" : "text-violet-600 group-hover:text-violet-850"}`}
                      style={{
                        background: action.isActive
                          ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
                          : isDark
                            ? "rgba(124,58,237,0.2)"
                            : "rgba(124,58,237,0.08)",
                        border: isDark
                          ? "1px solid rgba(167,139,250,0.25)"
                          : "1px solid rgba(124,58,237,0.2)",
                      }}
                    >
                      {action.icon}
                    </div>
                    <span
                      className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}
                    >
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.email}
                    </p>
                    <p
                      className={`text-xs font-medium truncate ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.email}
                    </p>
                  </div>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.location}
                    </p>
                    <p
                      className={`text-xs font-medium ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.location}
                    </p>
                  </div>
                </div>
              )}
              {contact.joined && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/8 text-white/40" : "bg-black/5 text-gray-400"}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${isDark ? "text-white/35" : "text-gray-400"}`}
                    >
                      {t.memberSince}
                    </p>
                    <p
                      className={`text-xs font-medium ${isDark ? "text-white/75" : "text-gray-700"}`}
                    >
                      {contact.joined}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`mx-5 border-t my-1 ${isDark ? "border-white/10" : "border-black/5"}`}
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
                  className={`text-[10px] uppercase tracking-wider mb-2 ${isDark ? "text-white/35" : "text-gray-400"}`}
                >
                  {t.mutualGroups}
                </p>
                <div className="space-y-1">
                  {contact.mutualGroups.map((group) => (
                    <button
                      key={group}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ease-in-out group ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-violet-300 bg-violet-500/20">
                          <Search className="w-3 h-3" />
                        </div>
                        <span
                          className={`text-xs font-medium ${isDark ? "text-white/70" : "text-gray-655"}`}
                        >
                          {group}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${isDark ? "text-white/25 group-hover:text-white/50" : "text-gray-400 group-hover:text-violet-650"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`mx-5 border-t my-1 ${isDark ? "border-white/10" : "border-black/5"}`}
            />

            <div className="px-5 py-3 space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ease-in-out ${isDark ? "hover:bg-white/8 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
              >
                <Shield
                  className={`w-4 h-4 ${isDark ? "text-white/35" : "text-gray-400"}`}
                />
                <span className="text-xs">{t.blockContact}</span>
              </button>
              <button
                onClick={onDeleteConversation}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/15 text-red-400 transition-all duration-200 ease-in-out"
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
