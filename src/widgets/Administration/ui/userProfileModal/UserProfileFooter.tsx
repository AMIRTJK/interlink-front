import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { T, primaryBtnStyle } from "../../theme/tokens";
import type { ProfileTab, ExtUserStatus } from "../../model";

const STATUS_OPTIONS: { value: ExtUserStatus; dot: string; label: string }[] = [
  { value: "Активен", dot: T.success, label: "Активен" },
  { value: "Неактивен", dot: "#94A3B8", label: "Неактивен" },
  { value: "В отпуске", dot: T.warning, label: "В отпуске" },
  { value: "В командировке", dot: T.accent, label: "В командировке" },
];

interface IUserProfileFooterProps {
  activeTab: ProfileTab;
  handleSaveRoles: () => void;
  setUserRolesPending: boolean;
  handleSaveOverrides: () => void;
  permsInitialized: boolean;
  isUserPermsLoading: boolean;
  updateDirectPending: boolean;
  updateDeniedPending: boolean;
  actionDropdownRef: React.RefObject<HTMLDivElement | null>;
  actionDropdownOpen: boolean;
  setActionDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  effectiveStatus: ExtUserStatus;
  handleStatusSelect: (status: ExtUserStatus) => void;
}

export function UserProfileFooter({
  activeTab,
  handleSaveRoles,
  setUserRolesPending,
  handleSaveOverrides,
  permsInitialized,
  isUserPermsLoading,
  updateDirectPending,
  updateDeniedPending,
  actionDropdownRef,
  actionDropdownOpen,
  setActionDropdownOpen,
  effectiveStatus,
  handleStatusSelect,
}: IUserProfileFooterProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
      }}
    >
      {activeTab === "profile" && (
        <button
          onClick={handleSaveRoles}
          disabled={setUserRolesPending}
          style={{
            ...primaryBtnStyle,
            background: T.accent,
            boxShadow: `0 2px 8px ${T.accent}35`,
            opacity: setUserRolesPending ? 0.7 : 1,
          }}
        >
          <Check size={14} />
          <span>Сохранить роли</span>
        </button>
      )}
      {activeTab === "access" && (
        <button
          onClick={handleSaveOverrides}
          disabled={
            !permsInitialized ||
            isUserPermsLoading ||
            updateDirectPending ||
            updateDeniedPending
          }
          style={{
            ...primaryBtnStyle,
            background: T.accent,
            boxShadow: `0 2px 8px ${T.accent}35`,
            opacity:
              !permsInitialized ||
              isUserPermsLoading ||
              updateDirectPending ||
              updateDeniedPending
                ? 0.7
                : 1,
          }}
        >
          <Check size={14} />
          <span>Сохранить права доступа</span>
        </button>
      )}
      <div ref={actionDropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setActionDropdownOpen((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 16px",
            height: 36,
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.textPrimary,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
          }}
        >
          <span>Действие</span>
          <ChevronDown size={13} />
        </button>
        {actionDropdownOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              right: 0,
              background: T.surface,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadowMd,
              zIndex: 400,
              minWidth: 190,
              overflow: "hidden",
              padding: "4px 0",
            }}
          >
            {STATUS_OPTIONS.map((opt) => {
              const isActive = effectiveStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusSelect(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 14px",
                    border: "none",
                    background: isActive ? "#EFF6FF" : "transparent",
                    cursor: "pointer",
                    fontFamily: T.font,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        T.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      isActive ? "#EFF6FF" : "transparent";
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: opt.dot,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: T.textPrimary,
                      fontWeight: isActive ? 700 : 400,
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </span>
                  {isActive && <Check size={12} color={T.accent} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
