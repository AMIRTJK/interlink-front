import * as React from "react";
import { X } from "lucide-react";
import { Avatar } from "@shared/ui";
import { T } from "../../theme/tokens";
import type { ExtUser } from "../../model";

interface IProps {
  user: ExtUser;
  resolvedRoles: string[];
  onClose: () => void;
}

export function UserDrawerHeader({ user, resolvedRoles, onClose }: IProps) {
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
        <Avatar
          colleague={{
            id: user.id,
            name: user.fio,
            initials: user.avatarInitials,
            photo: user.photoUrl,
          }}
          className="w-8 h-8 rounded-full"
          allowPreview={true}
        />
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
