import * as React from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { getRoleColor, EXT_STATUS_CFG } from "../../theme/tokens";
import type { ExtUser, RoleCard, PermModule, ProfileTab, ExtUserStatus } from "../../model";
import { extractPermNames, unmapStatus, applyEffectiveState } from "../../lib/adapters";
import { ACCESS_LEVEL_ITEMS, clonePerms, EMPTY_PERMS } from "./userProfileModalModel";

export function useUserProfileModalState({
  user,
  roleCards,
  addToast,
  onRolesSaved,
}: {
  user: ExtUser;
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
  const [serverDirect, setServerDirect] = React.useState<string[]>([]);
  const [serverDenied, setServerDenied] = React.useState<string[]>([]);
  const [permsInitialized, setPermsInitialized] = React.useState(false);
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

  const userPermsUrl = ApiRoutes.GET_USER_PERMISSIONS.replace(":id", user.id);
  const { data: userPermsData, isLoading: isUserPermsLoading } = useGetQuery({
    url: userPermsUrl,
    useToken: true,
    options: { enabled: !!user.id, refetchOnWindowFocus: false, staleTime: 0 },
  });

  const effectivePerms = React.useMemo(() => {
    const raw = (userPermsData?.data || userPermsData) as
      | { effective_permissions?: unknown }
      | undefined;
    return new Set(extractPermNames(raw?.effective_permissions));
  }, [userPermsData]);

  React.useEffect(() => {
    const raw = userPermsData?.data || userPermsData;
    if (!raw) return;
    setServerDirect(extractPermNames((raw as { direct_permissions?: unknown })?.direct_permissions));
    setServerDenied(extractPermNames((raw as { denied_permissions?: unknown })?.denied_permissions));
    if (!permsInitialized) {
      const roles = extractPermNames((raw as { roles?: unknown })?.roles);
      if (roles.length) {
        setLocalRoles(roles);
        setSelectedPermRole(roles[0]);
      }
    }
    setPermsInitialized(true);
  }, [userPermsData]);

  const unionRolePermissionNames = React.useMemo(() => {
    const set = new Set<string>();
    localRoles.forEach((roleName) => {
      const card = roleCards.find((c) => c.name === roleName);
      card?.permissionNames.forEach((p) => set.add(p));
    });
    return set;
  }, [localRoles, roleCards]);

  const setUserRolesM = useMutationQuery({
    url: () => ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const updateDirectM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DIRECT_PERMISSIONS.replace(":id", user.id),
    method: "PUT",
    messages: {
      suppressSuccessToast: true,
    },
  });

  const updateDeniedM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER_DENIED_PERMISSIONS.replace(":id", user.id),
    method: "PUT",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS, userPermsUrl],
    },
  });

  const updateStatusM = useMutationQuery({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", user.id),
    method: "PUT",
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

  const savedEffectivePerms = React.useMemo(
    () =>
      applyEffectiveState(
        defaultPermsForRole,
        unionRolePermissionNames,
        serverDirect,
        serverDenied,
      ),
    [defaultPermsForRole, unionRolePermissionNames, serverDirect, serverDenied],
  );

  React.useEffect(() => {
    if (!permsInitialized || !selectedRoleCard) return;
    setOverrides((prev) =>
      prev[selectedPermRole] ? prev : { ...prev, [selectedPermRole]: savedEffectivePerms },
    );
  }, [permsInitialized, selectedPermRole, selectedRoleCard, savedEffectivePerms]);

  const currentOverridePerms: PermModule[] =
    overrides[selectedPermRole] ?? savedEffectivePerms;

  const isDirty = React.useMemo(() => {
    const ov = overrides[selectedPermRole];
    if (!ov) return false;
    for (let mIdx = 0; mIdx < ov.length; mIdx++) {
      const oMod = ov[mIdx];
      const dMod = savedEffectivePerms[mIdx];
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
  }, [overrides, selectedPermRole, savedEffectivePerms]);

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
    const base = overrides[selectedPermRole] ?? clonePerms(savedEffectivePerms);
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

  const handleSaveOverrides = () => {
    if (!selectedRoleCard || updateDirectM.isPending || updateDeniedM.isPending) {
      return;
    }

    const roleBaseMap = new Map<string, boolean>();
    defaultPermsForRole.forEach((m) =>
      m.perms.forEach((p) =>
        p.subperms?.forEach((sp) => {
          if (sp.name) roleBaseMap.set(sp.name, sp.value);
        }),
      ),
    );

    const currentMap = new Map<string, boolean>();
    currentOverridePerms.forEach((m) =>
      m.perms.forEach((p) =>
        p.subperms?.forEach((sp) => {
          if (sp.name) currentMap.set(sp.name, sp.value);
        }),
      ),
    );

    const touched = new Set(roleBaseMap.keys());
    const nextDirect = serverDirect.filter((p) => !touched.has(p));
    const nextDenied = serverDenied.filter((p) => !touched.has(p));

    touched.forEach((permName) => {
      const roleHas = roleBaseMap.get(permName) ?? false;
      const wantsActive = currentMap.get(permName) ?? roleHas;
      if (wantsActive && !roleHas) {
        nextDirect.push(permName);
      } else if (!wantsActive && roleHas) {
        nextDenied.push(permName);
      }
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
                handleOverrideReset(selectedPermRole);
                addToast(`Доступ обновлён · ${user.fio} · роль ${selectedPermRole}`);
              },
            },
          );
        },
      },
    );
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

  const accessItems = ACCESS_LEVEL_ITEMS.map((it) => ({
    label: it.label,
    enabled: effectivePerms.has(it.perm),
  }));

  const handleStatusSelect = (status: ExtUserStatus) => {
    setActionDropdownOpen(false);
    updateStatusM.mutate(
      { status: unmapStatus(status) },
      {
        onSuccess: () => {
          setLocalStatus(status);
          addToast(`Статус обновлён: ${status}`);
        },
      },
    );
  };

  return {
    activeTab,
    setActiveTab,
    localRoles,
    setLocalRoles,
    selectedPermRole,
    setSelectedPermRole,
    permStaggerGen,
    setPermStaggerGen,
    resetConfirmRole,
    setResetConfirmRole,
    actionDropdownOpen,
    setActionDropdownOpen,
    localStatus,
    permsInitialized,
    isUserPermsLoading,
    actionDropdownRef,
    statusCfg,
    roleCfg,
    currentOverridePerms,
    isDirty,
    isSubpermCustomized,
    handleToggleOverride,
    handleOverrideReset,
    handleSaveOverrides,
    handleSaveRoles,
    handleStatusSelect,
    accessItems,
    setUserRolesM,
    updateDirectM,
    updateDeniedM,
  };
}
