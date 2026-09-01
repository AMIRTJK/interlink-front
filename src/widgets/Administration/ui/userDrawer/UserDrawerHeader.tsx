import * as React from "react";
import { X } from "lucide-react";
import { T, getRoleColor } from "../../theme/tokens";
import type { ExtUser } from "../../model";

interface IProps {
  user: ExtUser;
  resolvedRoles: string[];
  onClose: () => void;
}

export function UserDrawerHeader({ user, resolvedRoles, onClose }: IProps) {
  const primaryRole = resolvedRoles[0] ?? "";
  const roleCfg = getRoleColor(primaryRole);

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.fio}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: `1px solid ${roleCfg.text}25`,
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: roleCfg.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: roleCfg.text,
              flexShrink: 0,
              border: `1px solid ${roleCfg.text}25`,
            }}
          >
            {user.avatarInitials}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.fio}
          </div>
          <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 1 }}>
            {resolvedRoles.join(", ") || "Без роли"}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.textSecondary,
          padding: 4,
          borderRadius: 6,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
