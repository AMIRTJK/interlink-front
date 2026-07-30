import * as React from "react";
import { T, getRoleColor } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";

interface IProps {
  perms: PermModule[];
  staggerGen: number;
  togglePerm: (mIdx: number, pIdx: number, spIdx: number) => void;
  toggleChildPerm: (
    mIdx: number,
    pIdx: number,
    cIdx: number,
    spIdx: number,
  ) => void;
  roleName: string;
  userCount: number;
  memberInitials: string[];
}

export function RoleDrawerPermsList({
  perms,
  staggerGen,
  togglePerm,
  toggleChildPerm,
  roleName,
  userCount,
  memberInitials,
}: IProps) {
  const roleCfg = getRoleColor(roleName);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: T.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        Права доступа
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {perms.map((mod, mIdx) => (
          <div
            key={`${mod.module}-${staggerGen}`}
            style={{
              background: T.bg,
              borderRadius: 8,
              padding: "11px 14px",
              border: `1px solid ${T.border}`,
              animation: `permRowIn 200ms ease-out ${mIdx * 40}ms both`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.textPrimary,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {mod.module}
            </div>
            {mod.perms.map((perm, pIdx) => (
              <div
                key={`${perm.label}-${pIdx}-${staggerGen}`}
                style={{
                  background: T.surface,
                  borderRadius: 6,
                  padding: "10px 12px",
                  border: `1px solid ${T.border}`,
                  marginBottom: pIdx < mod.perms.length - 1 ? 6 : 0,
                }}
              >
                {perm.label && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: T.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    {perm.label}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                  }}
                >
                  {perm.subperms &&
                    perm.subperms.map((sp, spIdx) => (
                      <div
                        key={`${sp.label}-${staggerGen}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: sp.value ? T.textPrimary : "#94A3B8",
                            fontWeight: sp.value ? 500 : 400,
                          }}
                        >
                          {sp.label}
                        </span>
                        <ToggleSwitch
                          checked={sp.value}
                          onChange={() => togglePerm(mIdx, pIdx, spIdx)}
                        />
                      </div>
                    ))}
                </div>
                {perm.children &&
                  perm.children.map((child, cIdx) => (
                    <div
                      key={`${child.label}-${staggerGen}`}
                      style={{
                        marginTop: 10,
                        marginLeft: 8,
                        paddingLeft: 10,
                        borderLeft: `2px solid ${T.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: T.textSecondary,
                          marginBottom: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {child.label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {child.subperms &&
                          child.subperms.map((csp, cspIdx) => (
                            <div
                              key={`${csp.label}-${staggerGen}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  color: csp.value ? T.textPrimary : "#94A3B8",
                                  fontWeight: csp.value ? 500 : 400,
                                }}
                              >
                                {csp.label}
                              </span>
                              <ToggleSwitch
                                checked={csp.value}
                                onChange={() =>
                                  toggleChildPerm(mIdx, pIdx, cIdx, cspIdx)
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: T.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>Пользователи роли</span>
        <span
          style={{
            background: roleCfg.bg,
            color: roleCfg.text,
            borderRadius: 10,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {userCount}
        </span>
      </div>
      <div>
        {userCount === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: T.textSecondary,
              padding: "6px 0 10px",
              fontStyle: "italic",
            }}
          >
            Нет назначенных пользователей
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 6,
            }}
          >
            {memberInitials.map((initials, idx) => (
              <div
                key={`${initials}-${idx}`}
                title={initials}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: roleCfg.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: roleCfg.text,
                  border: `1.5px solid ${T.surface}`,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
