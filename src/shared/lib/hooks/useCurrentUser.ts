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

  const user = (data?.data ?? data) as ICurrentUserPermissions | undefined;

  const roles = user?.roles ?? [];
  const permissions = user?.permissions ?? [];
  const directPermissions = user?.direct_permissions ?? [];
  const deniedPermissions = user?.denied_permissions ?? [];

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
