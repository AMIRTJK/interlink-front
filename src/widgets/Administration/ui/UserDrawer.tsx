// Сайдбар прав КОНКРЕТНОГО ПОЛЬЗОВАТЕЛЯ — визуально повторяет RoleDrawer,
// но правит не саму роль, а effective = union(role_permissions) + direct - denied
// для этого пользователя (GET_USER_PERMISSIONS, PUT .../permissions/direct и /denied).
import * as React from "react";
import { X, Check } from "lucide-react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { T, getRoleColor } from "../theme/tokens";
import { ToggleSwitch } from "./components";
import type { ExtUser, PermModule } from "../model";
import {
  buildPermModules,
  extractPermNames,
  applyEffectiveState,
} from "../lib/adapters";

export function UserDrawer({
  user,
  allPermNames,
  onClose,
  isFirstOpen,
  addToast,
}: {
  user: ExtUser;
  allPermNames: string[];
  onClose: () => void;
  isFirstOpen: boolean;
  addToast: (msg: string) => void;
}) {
  const baseSkeleton = React.useMemo(
    () => buildPermModules(allPermNames, []),
    [allPermNames],
  );

  // Список пользователей (GET_USERS) не всегда честно отдаёт roles на строку —
  // поэтому роли/права роли берём из авторитетного GET_USER_PERMISSIONS
  // (там по ТЗ есть roles/role_permissions/direct_permissions/denied_permissions),
  // а не из прилетевшего пропа user.roles.
  const userPermsUrl = ApiRoutes.GET_USER_PERMISSIONS.replace(":id", user.id);
  const { data: userPermsData, isLoading: isUserPermsLoading } = useGetQuery({
    url: userPermsUrl,
    useToken: true,
    options: { enabled: !!user.id, refetchOnWindowFocus: false, staleTime: 0 },
  });

  const [perms, setPerms] = React.useState<PermModule[] | null>(null);
  const [staggerGen, setStaggerGen] = React.useState(0);
  const [resolvedRoles, setResolvedRoles] = React.useState<string[]>(user.roles);
  const [rolePermNames, setRolePermNames] = React.useState<string[]>([]);
  const [serverDirect, setServerDirect] = React.useState<string[]>([]);
  const [serverDenied, setServerDenied] = React.useState<string[]>([]);

  const primaryRole = resolvedRoles[0] ?? "";
  const roleCfg = getRoleColor(primaryRole);

  React.useEffect(() => {
    const raw = userPermsData?.data || userPermsData;
    if (!raw) return;
    const roles = extractPermNames((raw as { roles?: unknown })?.roles);
    const rolePerms = extractPermNames((raw as { role_permissions?: unknown })?.role_permissions);
    const direct = extractPermNames((raw as { direct_permissions?: unknown })?.direct_permissions);
    const denied = extractPermNames((raw as { denied_permissions?: unknown })?.denied_permissions);
    if (roles.length) setResolvedRoles(roles);
    setRolePermNames(rolePerms);
    setServerDirect(direct);
    setServerDenied(denied);
    setPerms(applyEffectiveState(baseSkeleton, new Set(rolePerms), direct, denied));
    setStaggerGen((g) => g + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPermsData]);

  const updateDirectM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DIRECT_PERMISSIONS.replace(":id", user.id),
    method: "PUT",
    // Инвалидация только на denied (второй PUT в паре) — не дублируем рефетч
    messages: { suppressSuccessToast: true },
  });
  const updateDeniedM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DENIED_PERMISSIONS.replace(":id", user.id),
    method: "PUT",
    messages: { suppressSuccessToast: true, invalidate: [ApiRoutes.GET_USERS, userPermsUrl] },
  });

  const togglePerm = (mIdx: number, pIdx: number, spIdx: number) => {
    setPerms((prev) =>
      !prev
        ? prev
        : prev.map((m, mi) =>
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

  const handleSave = () => {
    if (!perms) return;

    const currentMap = new Map<string, boolean>();
    perms.forEach((m) =>
      m.perms.forEach((p) =>
        p.subperms?.forEach((sp) => {
          if (sp.name) currentMap.set(sp.name, sp.value);
        }),
      ),
    );

    const roleHasSet = new Set(rolePermNames);
    const nextDirect: string[] = [];
    const nextDenied: string[] = [];
    currentMap.forEach((wantsActive, permName) => {
      const roleHas = roleHasSet.has(permName);
      if (wantsActive && !roleHas) nextDirect.push(permName);
      else if (!wantsActive && roleHas) nextDenied.push(permName);
    });

    updateDirectM.mutate(
      { permissions: nextDirect },
      {
        onSuccess: () => {
          updateDeniedM.mutate(
            { permissions: nextDenied },
            {
              onSuccess: () => {
                setServerDirect(nextDirect);
                setServerDenied(nextDenied);
                addToast(`Доступ обновлён · ${user.fio}`);
              },
            },
          );
        },
      },
    );
  };

  const isLoading = isUserPermsLoading || !perms;
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
          Права пользователя
        </div>
        {isLoading || !perms ? (
          <div style={{ fontSize: 13, color: T.textSecondary, padding: "6px 0" }}>
            Загрузка...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
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
                ))}
              </div>
            ))}
          </div>
        )}
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
          disabled={isLoading || updateDirectM.isPending || updateDeniedM.isPending}
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
            opacity:
              isLoading || updateDirectM.isPending || updateDeniedM.isPending
                ? 0.7
                : 1,
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
      </div>
    </div>
  );
}
