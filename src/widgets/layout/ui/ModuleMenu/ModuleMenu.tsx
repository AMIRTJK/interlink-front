import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { getModuleItems, MenuItem } from "./lib";
import { tokenControl, useGetQuery } from "@shared/lib";
import { useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import "./style.css";

interface IProps {
  variant: "horizontal" | "compact";
}

type SubMenuItem = {
  key: string;
  label: React.ReactNode;
  children?: MenuItem[];
  requiredRole?: string[];
  icon?: React.ReactNode;
};


interface IPermissionsResponse {
  data: {
    name: string;
    group: string;
    label: string;
  }[];
}

interface IUserProfileResponse {
  data: {
    position: string;
  };
}

export const ModuleMenu = ({ variant }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Мемоизируем items
  const items = useMemo(() => getModuleItems(variant), [variant]);

  const activeItem = items.find((item) => {
    if (!item || !("key" in item)) return false;
    const itemKey = String(item.key);
    return pathname === itemKey || pathname.startsWith(itemKey + "/");
  }) as SubMenuItem | undefined;

  const activeKey =
    activeItem?.key ||
    (pathname.includes("modules") ? "" : AppRoutes.PROFILE_TASKS);

  const subItems = activeItem?.children;

  const handleNavigate = (path: string) => {
    if (pathname !== path) {
      navigate(path);
    }
  };

  // Получаем права пользователя
  const { firstQueryData, secondQueryData } = useGetQuery<
    unknown,
    IPermissionsResponse, // Ответ первого запроса
    IPermissionsResponse, // Результат Select
    unknown,
    IUserProfileResponse  // Ответ второго запроса
  >({
    method: "GET",
    url: `${ApiRoutes.FETCH_PERMISSIONS}`,
    useToken: true,
    options: {
      enabled: tokenControl.get() !== null,
    },
    secondQuery: {
      url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
      method: "GET",
      shouldWaitFirst: true,
    },
  });

  // Получаем ВСЕ роли пользователя
  const userRolesArray = useMemo(() => {
    return (
      (
        firstQueryData as
          | { data: { group: string; name: string; permissions: string[] }[] }
          | undefined
      )?.data || []
    );
  }, [firstQueryData]);

  // Получаем список имен всех ролей пользователя
  const userRoleNames = useMemo(
    () => userRolesArray.map((item) => item.name),
    [userRolesArray]
  );
  // Получаем должность пользователя
  const userPosition = useMemo(() => {
    return secondQueryData?.data.position;
  }, [secondQueryData]);
  // Фильтруем элементы меню на основе ролей пользователя
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (!item || !("requiredRole" in item)) {
        return true;
      }
      const menuItem = item as SubMenuItem;
      // Если нет requiredRole, показываем элемент всем
      if (!menuItem.requiredRole || menuItem.requiredRole.length === 0) {
        return true;
      }
      // Проверяем должность - если Super Administrator, показываем все
      if (userPosition === "Super Administrator") {
        return true;
      }

      // Проверяем, есть ли хотя бы одна роль из requiredRole у пользователя
      const hasRole = menuItem.requiredRole.some((role) =>
        userRoleNames.includes(role)
      );
      return hasRole;
    });
    return filtered;
    // Добавлены все зависимости, которые используются внутри filter
  }, [items, userRoleNames, userPosition]);

  const menuItems = useMemo(() => {
    if (variant === "compact") {
      return filteredItems.map((item) => {
        if (item && "children" in item) {
          const { children: _, ...rest } = item as SubMenuItem;
          return rest;
        }
        return item;
      });
    }
    return filteredItems;
  }, [variant, filteredItems]);

  return (
    <div className={`menu-container ${variant}-mode`}>
      <Menu
        onClick={(e) => handleNavigate(e.key)}
        selectedKeys={[activeKey]}
        mode="horizontal"
        items={menuItems}
        theme="light"
        disabledOverflow
        className={`flex-wrap p-2 border-b-0! ${
          variant === "compact" ? "compact-style" : "full-style"
        }`}
      />
      {/* Вторая синяя полоса для подмодулей */}
      {variant === "compact" && (
        <div className="sub-menu-bar">
          {subItems?.map((sub) => {
            if (!sub || !("key" in sub)) return null;
            const isActive =
              pathname === sub.key || pathname.startsWith(sub.key + "/");
            return (
              <div
                key={sub.key}
                className={`sub-menu-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(sub.key as string)}
              >
                {"label" in sub ? sub.label : ""}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};