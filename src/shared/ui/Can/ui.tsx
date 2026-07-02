import type { ReactNode } from "react";
import { useCurrentUser } from "@shared/lib";

interface IProps {
  /** Право (или список прав) из effective permissions текущего пользователя */
  permission?: string | string[];
  /** Если true и передан массив — требуются все права, а не хотя бы одно */
  requireAll?: boolean;
  children: ReactNode;
  /** Что показать, если прав не хватает (по умолчанию — ничего) */
  fallback?: ReactNode;
}

/** Гейтинг UI-элементов по effective permissions из auth/me. Пока auth/me грузится — ничего не рендерит. */
export const Can = ({ permission, requireAll, children, fallback = null }: IProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (!permission) return <>{children}</>;

  const allowed = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  return allowed ? <>{children}</> : <>{fallback}</>;
};
