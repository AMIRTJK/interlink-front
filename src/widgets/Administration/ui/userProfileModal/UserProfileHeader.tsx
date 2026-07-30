import * as React from "react";
import { X, Users, ShieldAlert, Monitor, Activity } from "lucide-react";
import { T } from "../../theme/tokens";
import type { ExtUser, ProfileTab } from "../../model";

const PROFILE_TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Профиль", icon: <Users size={13} /> },
  { id: "access", label: "Права доступа", icon: <ShieldAlert size={13} /> },
  { id: "sessions", label: "Сессии", icon: <Monitor size={13} /> },
  { id: "history", label: "История", icon: <Activity size={13} /> },
];

interface IUserProfileHeaderProps {
  user: ExtUser;
  onClose: () => void;
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  statusCfg: { label: string; dot: string };
  roleCfg: { bg: string; text: string };
}

export function UserProfileHeader({
  user,
  onClose,
  activeTab,
  setActiveTab,
  statusCfg,
  roleCfg,
}: IUserProfileHeaderProps) {
  return (
    <div
      style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "20px 24px 0",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: roleCfg.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: roleCfg.text,
            flexShrink: 0,
            border: `1.5px solid ${roleCfg.text}25`,
          }}
        >
          {user.avatarInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 3,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              {user.fio}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: statusCfg.dot,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: T.textSecondary,
                  fontWeight: 500,
                }}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: T.textSecondary,
              marginBottom: 4,
            }}
          >
            {user.position}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              {user.email}
            </span>
            <span style={{ color: T.border }}>·</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              {user.department}
            </span>
            <span style={{ color: T.border }}>·</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              <span>С </span>
              <span>{user.joinedDate}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.textSecondary,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={15} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: -1 }}>
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? T.accent : T.textSecondary,
              fontFamily: T.font,
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${T.accent}`
                  : "2px solid transparent",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            <span style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
