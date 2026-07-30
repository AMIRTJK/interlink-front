import { Monitor, Smartphone, Globe, Clock } from "lucide-react";
import { T } from "../../theme/tokens";
import type { SessionInfo } from "../../model";

interface IUserProfileTabSessionsProps {
  lastActivity: string;
  sessions: SessionInfo[];
}

export function UserProfileTabSessions({
  lastActivity,
  sessions,
}: IUserProfileTabSessionsProps) {
  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: T.textSecondary,
          marginBottom: 6,
        }}
      >
        <span>Последняя активность: </span>
        <strong style={{ color: T.textPrimary }}>{lastActivity}</strong>
      </div>
      {sessions.map((s, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: T.surface,
            borderRadius: 10,
            padding: "14px 18px",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {s.icon === "monitor" ? (
              <Monitor size={18} color={T.accent} />
            ) : (
              <Smartphone size={18} color={T.accent} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T.textPrimary,
              }}
            >
              {s.device}
            </div>
            <div
              style={{
                fontSize: 12,
                color: T.textSecondary,
                marginTop: 2,
              }}
            >
              {s.os}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
                fontSize: 12,
                color: "#94A3B8",
              }}
            >
              <Globe size={10} />
              <span>{s.ip}</span>
              <span style={{ color: T.border, margin: "0 4px" }}>·</span>
              <Clock size={10} />
              <span style={{ marginLeft: 2 }}>{s.lastSeen}</span>
            </div>
          </div>
          <button
            style={{
              fontSize: 12,
              color: T.danger,
              background: "none",
              border: `1px solid ${T.danger}`,
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: T.font,
              padding: "6px 12px",
              whiteSpace: "nowrap",
            }}
          >
            Завершить
          </button>
        </div>
      ))}
    </div>
  );
}
