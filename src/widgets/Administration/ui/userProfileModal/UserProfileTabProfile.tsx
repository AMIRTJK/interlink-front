import * as React from "react";
import { T } from "../../theme/tokens";
import { MultiRolePicker } from "../components";
import type { ProfileTab } from "../../model";

interface IUserProfileTabProfileProps {
  stats: { value: string | number; label: string }[];
  localRoles: string[];
  setLocalRoles: (roles: string[]) => void;
  selectedPermRole: string;
  setSelectedPermRole: (role: string) => void;
  setPermStaggerGen: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: (tab: ProfileTab) => void;
  allRoleNames: string[];
  accessItems: { label: string; enabled: boolean }[];
}

export function UserProfileTabProfile({
  stats,
  localRoles,
  setLocalRoles,
  selectedPermRole,
  setSelectedPermRole,
  setPermStaggerGen,
  setActiveTab,
  allRoleNames,
  accessItems,
}: IUserProfileTabProfileProps) {
  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              background: T.surface,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              padding: "16px 20px",
              boxShadow: T.shadow,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: T.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: T.textSecondary,
                marginTop: 3,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: T.surface,
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          padding: "18px 20px",
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          Роли пользователя
        </div>
        <MultiRolePicker
          selectedRoles={localRoles}
          onChange={setLocalRoles}
          activeRole={selectedPermRole}
          onActiveRoleClick={(role) => {
            setSelectedPermRole(role);
            setPermStaggerGen((g) => g + 1);
            setActiveTab("access");
          }}
          allRoleNames={allRoleNames}
        />
      </div>
      <div
        style={{
          background: T.surface,
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          padding: "18px 20px",
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          Уровни доступа
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}
        >
          {accessItems.map((item, idx) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom:
                  idx < accessItems.length - 2
                    ? `1px solid ${T.border}`
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: T.textPrimary,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: item.enabled ? T.success : "#94A3B8",
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: item.enabled ? "#ECFDF5" : T.hoverBg,
                }}
              >
                {item.enabled ? "Да" : "Нет"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
