import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { getModuleItems, MenuItem } from "./lib";
import { tokenControl, useGetQuery } from "@shared/lib";
import { useEffect, useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import "./style.css";

interface IProps {
  variant: "horizontal" | "compact";
}
type TSubMenuItem = {
  key: string;
  label: React.ReactNode;
  children?: MenuItem[];
  requiredRole?: string[];
  icon?: React.ReactNode;
};

const SHARED_ROUTES = ["archive", "pinned", "trashed"];
const STORAGE_KEY = "correspondence_active_tab";

export const ModuleMenu = ({ variant }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Мемоизируем items
  const items = useMemo(() => getModuleItems(variant), [variant]);

  const hasChildren = (item: MenuItem): item is TSubMenuItem => {
    return item !== null && typeof item === "object" && "children" in item;
  };

  useEffect(() => {
    const isSharedRoute = SHARED_ROUTES.some((route) =>
      pathname.includes(route),
    );

    if (!isSharedRoute && pathname.includes("/correspondence")) {
      // Находим основной пункт "Корреспонденция"
      const correspondenceMenu = items.find(
        (item) => item?.key === AppRoutes.CORRESPONDENCE,
      );

      // Безопасно проверяем наличие детей через Type Guard
      if (correspondenceMenu && hasChildren(correspondenceMenu)) {
        const activeTab = correspondenceMenu.children?.find((sub) => {
          // Проверяем sub на null и наличие ключа (так как подпункты тоже Union)
          return sub && "key" in sub && pathname.startsWith(String(sub.key));
        });

        if (activeTab && "key" in activeTab) {
          sessionStorage.setItem(STORAGE_KEY, String(activeTab.key));
        }
      }
    }
  }, [pathname, items]);

  const activeItem = items.find((item) => {
    if (!item || !("key" in item)) return false;
    const itemKey = String(item.key);
    return pathname === itemKey || pathname.startsWith(itemKey + "/");
  }) as TSubMenuItem | undefined;

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
  const { data, preloadData } = useGetQuery({
    method: "GET",
    url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
    useToken: true,
    preload: true,
  });

  // Получаем ВСЕ роли пользователя (безопасное получение из профиля, если есть)
  const userRolesArray = useMemo(() => {
    const roles = (
      data as
        | { data: { group: string; name: string; permissions: string[] }[] }
        | undefined
    )?.data;
    return Array.isArray(roles) ? roles : [];
  }, [data]);

  // Получаем список имен всех ролей пользователя (включая preloadData)
  const userRoleNames = useMemo(() => {
    const namesFromRoles = userRolesArray.map((item) => item.name);
    const namesFromPreload =
      preloadData?.map((item: { name: string }) => item.name) || [];
    return [...new Set([...namesFromRoles, ...namesFromPreload])];
  }, [userRolesArray, preloadData]);

  // Получаем должность пользователя
  const userPosition = useMemo(() => {
    return (data as { data: { position: string } } | undefined)?.data?.position;
  }, [data]);
  // Фильтруем элементы меню на основе ролей пользователя
  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (!item || !("requiredRole" in item)) {
        return true;
      }
      const menuItem = item as TSubMenuItem;
      // Если нет requiredRole, показываем элемент всем
      if (!menuItem.requiredRole || menuItem.requiredRole.length === 0) {
        return true;
      }
      // Проверяем должность - если Super Administrator, показываем все
      if (userPosition === "Super Administrator") {
        return true;
      }

      // Проверяем, есть ли хотя бы одна роль из requiredRole у пользователя
      const hasRole = menuItem.requiredRole.some(
        (role) =>
          userRoleNames.includes(role) ||
          preloadData?.some((p: { name: string }) => p.name === role),
      );
      return hasRole;
    });
    return filtered;
    // Добавлены все зависимости, которые используются внутри filter
  }, [items, userRoleNames, userPosition, preloadData]);

  const menuItems = useMemo(() => {
    if (variant === "compact") {
      return filteredItems.map((item) => {
        if (item && "children" in item) {
          const { children: _, ...rest } = item as TSubMenuItem;
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

            const subKey = String(sub.key);

            const isDirectMatch =
              pathname === subKey || pathname.startsWith(subKey + "/");

            const isRestoredMatch = (() => {
              const isSharedRoute = SHARED_ROUTES.some((route) =>
                pathname.includes(route),
              );
              if (isSharedRoute) {
                const lastActiveKey = sessionStorage.getItem(STORAGE_KEY);
                return lastActiveKey === subKey;
              }
              return false;
            })();

            const isActive = isDirectMatch || isRestoredMatch;

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
