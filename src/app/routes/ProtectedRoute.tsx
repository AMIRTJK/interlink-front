import { Outlet } from "react-router-dom";
import { useCurrentUser } from "@shared/lib";
import { Loader } from "@shared/ui/Loader";
import { ForbiddenPage } from "@shared/ui/ForbiddenPage";

interface IProps {
  /** Право (или список прав) из effective permissions, нужное для доступа к вложенным роутам */
  permission: string | string[];
  /** Если true и передан массив прав — требуются все, а не хотя бы одно */
  requireAll?: boolean;
}

/**
 * Ставится внутри уже приватного дерева (после PrivateRoute) и дополнительно
 * проверяет effective permissions пользователя из auth/me.
 */
const ProtectedRoute = ({ permission, requireAll }: IProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
    useCurrentUser();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  const allowed = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!allowed) {
    return <ForbiddenPage />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
