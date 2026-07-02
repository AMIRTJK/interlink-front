// Порт RoleDrawer из IAMDashboard.tsx — редактор прав роли.
// Данные: свежие права роли из GET_ROLE, сохранение через UPDATE_ROLE.
import * as React from "react";
import { X, Check, LogOut } from "lucide-react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { T, getRoleColor } from "../theme/tokens";
import { ToggleSwitch } from "./components";
import type { RoleCard, PermModule } from "../model";
import {
  buildPermModules,
  collectEnabledPermNames,
  extractPermNames,
} from "../lib/adapters";

function clonePerms(perms: PermModule[]): PermModule[] {
  return perms.map((m) => ({
    ...m,
    perms: m.perms.map((p) => ({
      ...p,
      subperms: p.subperms ? p.subperms.map((sp) => ({ ...sp })) : undefined,
      children: p.children
        ? p.children.map((ch) => ({
            ...ch,
            subperms: ch.subperms
              ? ch.subperms.map((csp) => ({ ...csp }))
              : undefined,
          }))
        : undefined,
    })),
  }));
}

export function RoleDrawer({
  role,
  allPermNames,
  userCount,
  memberInitials,
  onClose,
  isFirstOpen,
  onSaved,
  onDeleteRequest,
  addToast,
}: {
  role: RoleCard;
  allPermNames: string[];
  userCount: number;
  memberInitials: string[];
  onClose: () => void;
  isFirstOpen: boolean;
  onSaved: () => void;
  onDeleteRequest: () => void;
  addToast: (msg: string) => void;
}) {
  const roleName = role.name;
  const roleCfg = getRoleColor(roleName);
  const [perms, setPerms] = React.useState<PermModule[]>(() =>
    clonePerms(role.perms),
  );
  const [staggerGen, setStaggerGen] = React.useState(0);

  // Свежие права роли (список GET_ROLES кэшируется, берём из GET_ROLE)
  const { data: roleDetailData } = useGetQuery({
    url: ApiRoutes.GET_ROLE.replace(":id", role.id),
    useToken: true,
    options: { enabled: !!role.id, refetchOnWindowFocus: false, staleTime: 0 },
  });

  React.useEffect(() => {
    const fresh = (roleDetailData?.data || roleDetailData) as
      | { permissions?: unknown }
      | undefined;
    if (!fresh) return;
    const freshNames = extractPermNames(fresh.permissions);
    setPerms(buildPermModules(allPermNames, freshNames));
    setStaggerGen((g) => g + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleDetailData, allPermNames.length]);

  const updateRoleM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_ROLE.replace(":id", role.id),
    method: "PUT",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

  const togglePerm = (mIdx: number, pIdx: number, spIdx: number) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p, pi) =>
                pi !== pIdx
                  ? p
                  : {
                      ...p,
                      subperms: p.subperms
                        ? p.subperms.map((sp, si) =>
                            si !== spIdx ? sp : { ...sp, value: !sp.value },
                          )
                        : p.subperms,
                    },
              ),
            },
      ),
    );
  };

  const toggleChildPerm = (
    mIdx: number,
    pIdx: number,
    cIdx: number,
    spIdx: number,
  ) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p, pi) =>
                pi !== pIdx
                  ? p
                  : {
                      ...p,
                      children: p.children
                        ? p.children.map((ch, ci) =>
                            ci !== cIdx
                              ? ch
                              : {
                                  ...ch,
                                  subperms: ch.subperms
                                    ? ch.subperms.map((sp, si) =>
                                        si !== spIdx
                                          ? sp
                                          : { ...sp, value: !sp.value },
                                      )
                                    : ch.subperms,
                                },
                          )
                        : p.children,
                    },
              ),
            },
      ),
    );
  };

  const handleSave = () => {
    updateRoleM.mutate(
      { name: role.name, permissions: collectEnabledPermNames(perms) },
      {
        onSuccess: () => {
          addToast(`Изменения сохранены · ${role.name}`);
          onSaved();
        },
      },
    );
  };

  const panelStyle: React.CSSProperties = isFirstOpen
    ? { animation: "drawerSlideIn 320ms cubic-bezier(0,0,0.2,1) forwards" }
    : {};

  return (
    <div
      style={{
        width: 340,
        minWidth: 340,
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: T.font,
        ...panelStyle,
      }}
    >
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
                                    color: csp.value
                                      ? T.textPrimary
                                      : "#94A3B8",
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

      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={handleSave}
          disabled={updateRoleM.isPending}
          style={{
            flex: 1,
            padding: "0 14px",
            height: 36,
            borderRadius: 8,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: updateRoleM.isPending ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = T.accent;
          }}
        >
          <Check size={13} />
          <span>Сохранить</span>
        </button>
        <button
          onClick={onDeleteRequest}
          style={{
            padding: "0 12px",
            height: 36,
            borderRadius: 8,
            border: `1.5px solid ${T.danger}`,
            background: "transparent",
            color: T.danger,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            gap: 5,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <LogOut size={13} />
          <span>Удалить</span>
        </button>
      </div>
    </div>
  );
}
