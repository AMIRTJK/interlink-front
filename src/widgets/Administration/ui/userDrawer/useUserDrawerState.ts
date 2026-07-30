import * as React from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { ExtUser, PermModule } from "../../model";
import {
  buildPermModules,
  extractPermNames,
  applyEffectiveState,
} from "../../lib/adapters";

interface IUseUserDrawerStateProps {
  user: ExtUser;
  allPermNames: string[];
  addToast: (msg: string) => void;
}

export function useUserDrawerState({
  user,
  allPermNames,
  addToast,
}: IUseUserDrawerStateProps) {
  const baseSkeleton = React.useMemo(
    () => buildPermModules(allPermNames, []),
    [allPermNames],
  );

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

  return {
    perms,
    staggerGen,
    resolvedRoles,
    isLoading,
    updateDirectM,
    updateDeniedM,
    togglePerm,
    handleSave,
  };
}
