import * as React from "react";
import { T, getRoleColor } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";

interface IUserProfileTabAccessProps {
  localRoles: string[];
  selectedPermRole: string;
  setSelectedPermRole: (role: string) => void;
  setPermStaggerGen: React.Dispatch<React.SetStateAction<number>>;
  resetConfirmRole: string | null;
  setResetConfirmRole: (role: string | null) => void;
  isDirty: boolean;
  handleOverrideReset: (roleName: string) => void;
  currentOverridePerms: PermModule[];
  permStaggerGen: number;
  isSubpermCustomized: (mIdx: number, pIdx: number, spIdx: number) => boolean;
  handleToggleOverride: (mIdx: number, pIdx: number, spIdx: number) => void;
}

export function UserProfileTabAccess({
  localRoles,
  selectedPermRole,
  setSelectedPermRole,
  setPermStaggerGen,
  resetConfirmRole,
  setResetConfirmRole,
  isDirty,
  handleOverrideReset,
  currentOverridePerms,
  permStaggerGen,
  isSubpermCustomized,
  handleToggleOverride,
}: IUserProfileTabAccessProps) {
  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {localRoles.map((role) => {
            const cfg = getRoleColor(role);
            const isActive = selectedPermRole === role;
            return (
              <button
                key={role}
                onClick={() => {
                  setSelectedPermRole(role);
                  setPermStaggerGen((g) => g + 1);
                  setResetConfirmRole(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: isActive
                    ? `1.5px solid ${cfg.text}`
                    : `1px solid ${cfg.text}30`,
                  background: isActive ? cfg.bg : "transparent",
                  color: cfg.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: T.font,
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: cfg.text,
                    display: "inline-block",
                  }}
                />
                <span>{role}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isDirty && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#FFFBEB",
                color: "#92400E",
                borderRadius: 6,
                padding: "3px 9px",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid #FDE68A",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: T.warning,
                  display: "inline-block",
                }}
              />
              <span>Есть изменения</span>
            </span>
          )}
          {resetConfirmRole === selectedPermRole ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#FEF2F2",
                border: `1px solid #FECACA`,
                borderRadius: 8,
                padding: "5px 10px",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#991B1B",
                  fontWeight: 500,
                }}
              >
                Сбросить?
              </span>
              <button
                onClick={() => {
                  handleOverrideReset(selectedPermRole);
                  setResetConfirmRole(null);
                  setPermStaggerGen((g) => g + 1);
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.danger,
                  background: "none",
                  border: `1px solid ${T.danger}`,
                  borderRadius: 6,
                  padding: "2px 8px",
                  cursor: "pointer",
                  fontFamily: T.font,
                }}
              >
                Да
              </button>
              <button
                onClick={() => setResetConfirmRole(null)}
                style={{
                  fontSize: 12,
                  color: T.textSecondary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.font,
                }}
              >
                Нет
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResetConfirmRole(selectedPermRole)}
              style={{
                fontSize: 12,
                color: T.textSecondary,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontFamily: T.font,
                textDecoration: "underline",
                textDecorationStyle: "dashed",
                textUnderlineOffset: 2,
              }}
            >
              Сбросить до стандарта
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {currentOverridePerms.map((mod, mIdx) => (
          <div
            key={`${mod.module}-${permStaggerGen}`}
            style={{
              background: T.surface,
              borderRadius: 10,
              padding: "14px 16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              animation: `permRowIn 200ms ease-out ${mIdx * 50}ms both`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.textPrimary,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {mod.module}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {mod.perms.map((perm, pIdx) => (
                <div
                  key={`${perm.label}-${permStaggerGen}`}
                  style={{
                    background: T.bg,
                    borderRadius: 8,
                    padding: "11px 13px",
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {perm.label && (
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: T.textPrimary,
                        marginBottom: 10,
                      }}
                    >
                      {perm.label}
                    </div>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(170px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {perm.subperms &&
                      perm.subperms.map((sp, spIdx) => {
                        const customized = isSubpermCustomized(
                          mIdx,
                          pIdx,
                          spIdx,
                        );
                        return (
                          <div
                            key={`${sp.label}-${permStaggerGen}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: customized
                                ? "#FFFBEB"
                                : "transparent",
                              border: customized
                                ? "1px solid #FDE68A"
                                : "1px solid transparent",
                              transition: "all 0.15s",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              {customized && (
                                <span
                                  style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: T.warning,
                                    display: "inline-block",
                                    flexShrink: 0,
                                  }}
                                  title="Изменено от стандарта"
                                />
                              )}
                              <span
                                style={{
                                  fontSize: 12,
                                  color: sp.value
                                    ? T.textPrimary
                                    : "#94A3B8",
                                  fontWeight: sp.value ? 500 : 400,
                                }}
                              >
                                {sp.label}
                              </span>
                            </div>
                            <ToggleSwitch
                              checked={sp.value}
                              onChange={() =>
                                handleToggleOverride(mIdx, pIdx, spIdx)
                              }
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
