import { useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "./useGetQuery";
import { tokenControl } from "../tokenControl";

/** Минимальная форма auth/me, нужная для прав доступа (полный профиль см. entities/login IUser) */
export interface ICurrentUserPermissions {
  id: number;
  full_name?: string;
  roles: string[];
  direct_permissions?: string[];
  denied_permissions?: string[];
  permissions: string[];
}

/**
 * Текущий пользователь + его effective-права (auth/me).
 * permissions в ответе backend уже посчитан как role_permissions + direct_permissions - denied_permissions.
 */
export const useCurrentUser = () => {
  const token = tokenControl.get();

  const { data, isLoading, isError, refetch } = useGetQuery({
    url: ApiRoutes.AUTH_ME,
    useToken: true,
    options: {
      enabled: !!token,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  // auth/me отдаёт пользователя вложенным (`data.data.user`), а права могут
  // лежать как внутри пользователя, так и рядом с ним. Читаем оба уровня:
  // иначе permissions остаются пустыми и <Can> прячет весь интерфейс.
  const envelope = (data?.data ?? data) as
    | (Partial<ICurrentUserPermissions> & { user?: ICurrentUserPermissions })
    | undefined;
  const user = (envelope?.user ?? envelope) as
    | ICurrentUserPermissions
    | undefined;

  const roles = user?.roles ?? envelope?.roles ?? [];
  const permissions = user?.permissions ?? envelope?.permissions ?? [];
  const directPermissions =
    user?.direct_permissions ?? envelope?.direct_permissions ?? [];
  const deniedPermissions =
    user?.denied_permissions ?? envelope?.denied_permissions ?? [];

  const hasPermission = useMemo(
    () => (permission: string) => permissions.includes(permission),
    [permissions],
  );
  const hasAnyPermission = useMemo(
    () => (perms: string[]) => perms.some((p) => permissions.includes(p)),
    [permissions],
  );
  const hasAllPermissions = useMemo(
    () => (perms: string[]) => perms.every((p) => permissions.includes(p)),
    [permissions],
  );
  const hasRole = useMemo(
    () => (role: string) => roles.includes(role),
    [roles],
  );

  return {
    user,
    roles,
    permissions,
    directPermissions,
    deniedPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isLoading: !!token && isLoading,
    isError,
    refetch,
  };
};
