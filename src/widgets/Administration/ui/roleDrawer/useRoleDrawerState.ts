import * as React from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { RoleCard, PermModule } from "../../model";
import {
  buildPermModules,
  collectEnabledPermNames,
  extractPermNames,
} from "../../lib/adapters";
import { clonePerms } from "./roleDrawerModel";

interface IUseRoleDrawerStateProps {
  role: RoleCard;
  allPermNames: string[];
  onSaved: () => void;
  addToast: (msg: string) => void;
}

export function useRoleDrawerState({
  role,
  allPermNames,
  onSaved,
  addToast,
}: IUseRoleDrawerStateProps) {
  const [perms, setPerms] = React.useState<PermModule[]>(() =>
    clonePerms(role.perms),
  );
  const [staggerGen, setStaggerGen] = React.useState(0);

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

  return {
    perms,
    staggerGen,
    updateRoleM,
    togglePerm,
    toggleChildPerm,
    handleSave,
  };
}
