// Порт UserProfileModal из IAMDashboard.tsx (табы Профиль/Права/Сессии/История).
// Реальные данные: профиль из ExtUser, роли — SET_USER_ROLES, уровни доступа —
// GET_USER_PERMISSIONS (effective). MOCK: сессии, история, статистика профиля.
import * as React from "react";
import {
  X,
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  Activity,
  Users,
  ShieldAlert,
} from "lucide-react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  T,
  getRoleColor,
  EXT_STATUS_CFG,
  primaryBtnStyle,
} from "../theme/tokens";
import { ToggleSwitch, MultiRolePicker } from "./components";
import type {
  ExtUser,
  RoleCard,
  PermModule,
  ProfileTab,
  ExtUserStatus,
} from "../model";
import { mockSessions, mockHistory, mockProfileStats } from "../lib/mock";
import { extractPermNames } from "../lib/adapters";

const EMPTY_PERMS: PermModule[] = [];

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

// Ключевые уровни доступа → сырые имена прав (для колонки «Уровни доступа»)
const ACCESS_LEVEL_ITEMS: { label: string; perm: string }[] = [
  { label: "Личный кабинет — Просмотр", perm: "profile.view" },
  { label: "Персонал — Просмотр", perm: "users.view" },
  { label: "Персонал — Редактирование", perm: "users.update" },
  { label: "Корреспонденция — Создание", perm: "correspondence.create" },
  { label: "Чат — Просмотр", perm: "tasks.view" },
  { label: "Управление пользователями", perm: "users.manage_ui" },
];

export function UserProfileModal({
  user,
  onClose,
  allRoleNames,
  roleCards,
  addToast,
  onRolesSaved,
}: {
  user: ExtUser;
  onClose: () => void;
  allRoleNames: string[];
  roleCards: RoleCard[];
  addToast: (msg: string) => void;
  onRolesSaved?: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("profile");
  const [localRoles, setLocalRoles] = React.useState<string[]>(user.roles);
  const [selectedPermRole, setSelectedPermRole] = React.useState<string>(
    user.roles[0] ?? "",
  );
  const [permStaggerGen, setPermStaggerGen] = React.useState(0);
  const [resetConfirmRole, setResetConfirmRole] = React.useState<string | null>(
    null,
  );
  const [actionDropdownOpen, setActionDropdownOpen] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<ExtUserStatus>(
    user.status,
  );
  const [overrides, setOverrides] = React.useState<
    Record<string, PermModule[]>
  >({});
  const actionDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(e.target as Node)
      )
        setActionDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (localRoles.length && !localRoles.includes(selectedPermRole)) {
      setSelectedPermRole(localRoles[0]);
      setPermStaggerGen((g) => g + 1);
    }
  }, [localRoles, selectedPermRole]);

  // Реальные права пользователя (для «Уровни доступа»)
  const { data: userPermsData } = useGetQuery({
    url: ApiRoutes.GET_USER_PERMISSIONS.replace(":id", user.id),
    useToken: true,
    options: { enabled: !!user.id, refetchOnWindowFocus: false, staleTime: 0 },
  });

  const effectivePerms = React.useMemo(() => {
    const raw = (userPermsData?.data || userPermsData) as
      | { effective_permissions?: unknown }
      | undefined;
    return new Set(extractPermNames(raw?.effective_permissions));
  }, [userPermsData]);

  const setUserRolesM = useMutationQuery({
    url: () => ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const effectiveStatus = localStatus;
  const statusCfg =
    EXT_STATUS_CFG[effectiveStatus] ?? EXT_STATUS_CFG["Активен"];
  const primaryRole = localRoles[0] ?? user.roles[0] ?? "";
  const roleCfg = getRoleColor(primaryRole);
  const selectedRoleCard = roleCards.find((c) => c.name === selectedPermRole);
  const defaultPermsForRole: PermModule[] = selectedRoleCard
    ? selectedRoleCard.perms
    : EMPTY_PERMS;
  const currentOverridePerms: PermModule[] =
    overrides[selectedPermRole] ?? defaultPermsForRole;

  const isDirty = React.useMemo(() => {
    const ov = overrides[selectedPermRole];
    if (!ov) return false;
    for (let mIdx = 0; mIdx < ov.length; mIdx++) {
      const oMod = ov[mIdx];
      const dMod = defaultPermsForRole[mIdx];
      if (!dMod) return true;
      for (let pIdx = 0; pIdx < oMod.perms.length; pIdx++) {
        const oPerm = oMod.perms[pIdx];
        const dPerm = dMod.perms[pIdx];
        if (!dPerm) return true;
        if (oPerm.subperms) {
          for (let spIdx = 0; spIdx < oPerm.subperms.length; spIdx++) {
            const oSp = oPerm.subperms[spIdx];
            const dSp = dPerm.subperms?.[spIdx];
            if (!dSp || oSp.value !== dSp.value) return true;
          }
        }
      }
    }
    return false;
  }, [overrides, selectedPermRole, defaultPermsForRole]);

  const isSubpermCustomized = (
    mIdx: number,
    pIdx: number,
    spIdx: number,
  ): boolean => {
    const ov = overrides[selectedPermRole];
    if (!ov) return false;
    const oSp = ov?.[mIdx]?.perms?.[pIdx]?.subperms?.[spIdx];
    const dSp = defaultPermsForRole?.[mIdx]?.perms?.[pIdx]?.subperms?.[spIdx];
    return !!oSp && !!dSp && oSp.value !== dSp.value;
  };

  const handleToggleOverride = (mIdx: number, pIdx: number, spIdx: number) => {
    const base = overrides[selectedPermRole] ?? clonePerms(defaultPermsForRole);
    const updated = base.map((m, mi) =>
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
    );
    setOverrides((prev) => ({ ...prev, [selectedPermRole]: updated }));
  };

  const handleOverrideReset = (roleName: string) => {
    setOverrides((prev) => {
      const n = { ...prev };
      delete n[roleName];
      return n;
    });
  };

  const handleSaveRoles = () => {
    setUserRolesM.mutate(
      { user_id: Number(user.id), roles: localRoles },
      {
        onSuccess: () => {
          addToast(`Роли обновлены · ${user.fio}`);
          onRolesSaved?.();
        },
      },
    );
  };

  const stats = mockProfileStats(); // MOCK
  const sessions = mockSessions(); // MOCK
  const historyItems = mockHistory(); // MOCK

  const accessItems = ACCESS_LEVEL_ITEMS.map((it) => ({
    label: it.label,
    enabled: effectivePerms.has(it.perm),
  }));

  const STATUS_OPTIONS: { value: ExtUserStatus; dot: string; label: string }[] =
    [
      { value: "Активен", dot: T.success, label: "Активен" },
      { value: "Неактивен", dot: "#94A3B8", label: "Неактивен" },
      { value: "В отпуске", dot: T.warning, label: "В отпуске" },
      { value: "В командировке", dot: T.accent, label: "В командировке" },
    ];

  const PROFILE_TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] =
    [
      { id: "profile", label: "Профиль", icon: <Users size={13} /> },
      { id: "access", label: "Права доступа", icon: <ShieldAlert size={13} /> },
      { id: "sessions", label: "Сессии", icon: <Monitor size={13} /> },
      { id: "history", label: "История", icon: <Activity size={13} /> },
    ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "backdropIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: 10,
          boxShadow: T.shadowXl,
          animation: "modalFadeIn 0.2s ease-out forwards",
          width: "90vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.font,
        }}
      >
        {/* Header */}
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
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

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
          {activeTab === "profile" && (
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
          )}

          {activeTab === "access" && (
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
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
              {isDirty && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 4,
                  }}
                >
                  {/* Сохранение переопределения прав на уровне пользователя.
                      MOCK-поведение как в референсе: локально + тост.
                      Точную семантику direct/denied подтвердит backend. */}
                  <button
                    onClick={() =>
                      addToast(
                        `Доступ обновлён (локально) · ${user.fio} · роль ${selectedPermRole}`,
                      )
                    }
                    style={{
                      ...primaryBtnStyle,
                      background: T.accent,
                      boxShadow: `0 2px 10px ${T.accent}35`,
                    }}
                  >
                    <Check size={14} />
                    <span>Сохранить изменения доступа</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
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
                <strong style={{ color: T.textPrimary }}>
                  {user.lastActivity}
                </strong>
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
          )}

          {activeTab === "history" && (
            <div style={{ padding: "20px 24px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                {historyItems.map((h, idx) => (
                  <div
                    key={idx}
                    style={{ display: "flex", gap: 14, paddingBottom: 0 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                        paddingTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#EFF6FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Activity size={12} color={T.accent} />
                      </div>
                      {idx < historyItems.length - 1 && (
                        <div
                          style={{
                            width: 1,
                            height: 28,
                            background: T.border,
                            marginTop: 4,
                            marginBottom: 4,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        background: T.surface,
                        borderRadius: 10,
                        padding: "12px 16px",
                        border: `1px solid ${T.border}`,
                        flex: 1,
                        boxShadow: T.shadow,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          color: T.textPrimary,
                          lineHeight: 1.5,
                          fontWeight: 500,
                        }}
                      >
                        {h.action}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94A3B8",
                          marginTop: 4,
                        }}
                      >
                        {h.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
          <button
            onClick={handleSaveRoles}
            disabled={setUserRolesM.isPending}
            style={{
              ...primaryBtnStyle,
              background: T.accent,
              boxShadow: `0 2px 8px ${T.accent}35`,
              opacity: setUserRolesM.isPending ? 0.7 : 1,
            }}
          >
            <Check size={14} />
            <span>Сохранить изменения</span>
          </button>
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
                      onClick={() => {
                        // MOCK-поведение как в референсе: локально + тост.
                        // Персист статуса подтвердит backend (UPDATE_USER).
                        setLocalStatus(opt.value);
                        addToast(`Статус обновлён: ${opt.value}`);
                        setActionDropdownOpen(false);
                      }}
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
      </div>
    </div>
  );
}
