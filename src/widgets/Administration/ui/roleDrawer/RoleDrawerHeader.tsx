import * as React from "react";
import { X } from "lucide-react";
import { T, getRoleColor } from "../../theme/tokens";
import type { RoleCard } from "../../model";

interface IProps {
  role: RoleCard;
  onClose: () => void;
}

export function RoleDrawerHeader({ role, onClose }: IProps) {
  const roleName = role.name;
  const roleCfg = getRoleColor(roleName);

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            {roleName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {roleName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.textSecondary,
                marginTop: 1,
              }}
            >
              {role.description}
            </div>
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
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
