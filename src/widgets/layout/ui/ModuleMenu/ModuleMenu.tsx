import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { getModuleItems, MenuItem } from "./lib";
import { tokenControl, useGetQuery } from "@shared/lib";
import { useMemo } from "react";
import "./style.css";
import { ApiRoutes } from "@shared/api";

/* ===================== TYPES ===================== */
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

interface IPermission {
  group: string;
  name: string;
  label: string;
}

interface IUserResponse {
  data: {
    position: string;
    // добавь другие поля если нужно
  };
}

/* ===================== COMPONENT ===================== */
export const ModuleMenu = ({ variant }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 1. Мемоизируем элементы меню
  const items = useMemo(() => getModuleItems(variant), [variant]);

  // 2. Получаем права и данные пользователя через наш "умный" хук
  const { firstQueryData, secondQueryData } = useGetQuery<
    unknown,
    { data: IPermission[] }, // Тип первого ответа
    { data: IPermission[] }, // Тип select
    unknown,
    IUserResponse            // Тип второго ответа
  >({
    method: "GET",
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      enabled: tokenControl.get() !== null,
    },
    secondQuery: {
      url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
      method: "GET",
      shouldWaitFirst: true, // Включаем последовательную загрузку
    },
  });

  // 3. Извлекаем имена ролей (прав)
  const userRoleNames = useMemo(() => {
    return firstQueryData?.data?.map((p) => p.name) || [];
  }, [firstQueryData]);

  // 4. Извлекаем должность
  const userPosition = useMemo(() => {
    return secondQueryData?.data?.position;
  }, [secondQueryData]);

  // 5. Фильтруем элементы меню 
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Если у элемента нет требований по ролям, показываем его
      if (!item || !("requiredRole" in item)) {
        return true;
      }

      const menuItem = item as SubMenuItem;
      
      // Если список ролей пуст, показываем всем
      if (!menuItem.requiredRole || menuItem.requiredRole.length === 0) {
        return true;
      }

      // Админу разрешено всё
      if (userPosition === "Super Administrator") {
        return true;
      }

      // Проверка наличия хотя бы одной нужной роли
      return menuItem.requiredRole.some((role) => userRoleNames.includes(role));
    });
  }, [items, userRoleNames, userPosition]);

  // 6. Подготавливаем элементы для Ant Design Menu
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

  // 7. Логика активных ключей
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

      {/* Саб-меню для компактного режима */}
      {variant === "compact" && subItems && (
        <div className="sub-menu-bar">
          {subItems.map((sub) => {
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