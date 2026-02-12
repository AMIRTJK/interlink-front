import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { getModuleItems, MenuItem } from "./lib";
import { tokenControl, useGetQuery } from "@shared/lib";
import { useEffect, useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import { motion, AnimatePresence } from "framer-motion";
import { IosVariant } from "./IosVariant";
import "./style.css";

interface IProps {
  variant: "horizontal" | "compact" | "modern" | "full" | "ios";
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

  const items = useMemo(() => getModuleItems(variant), [variant]);

  const { data, preloadData } = useGetQuery({
    method: "GET",
    url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
    useToken: true,
    preload: true,
  });

  const userRolesArray = useMemo(() => {
    const roles = (
      data as
        | { data: { group: string; name: string; permissions: string[] }[] }
        | undefined
    )?.data;
    return Array.isArray(roles) ? roles : [];
  }, [data]);

  console.log(userRolesArray);

  const userRoleNames = useMemo(() => {
    const namesFromRoles = userRolesArray.map((item) => item.name);
    const namesFromPreload =
      preloadData?.map((item: { name: string }) => item.name) || [];
    return [...new Set([...namesFromRoles, ...namesFromPreload])];
  }, [userRolesArray, preloadData]);

  console.log(userRoleNames);

  const userPosition = useMemo(() => {
    return (data as { data: { position: string } } | undefined)?.data?.position;
  }, [data]);

  const hasChildren = (item: MenuItem): item is TSubMenuItem => {
    return item !== null && typeof item === "object" && "children" in item;
  };

  const filteredItems = useMemo(() => {
    const checkAccess = (item: MenuItem): boolean => {
      if (!item || !("requiredRole" in item)) return true;
      const menuItem = item as TSubMenuItem;
      if (!menuItem.requiredRole?.length) return true;
      if (userPosition === "Super Administrator") return true;

      return menuItem.requiredRole.some(
        (role) =>
          userRoleNames.includes(role) ||
          preloadData?.some((p: { name: string }) => p.name === role),
      );
    };

    const filterRecursively = (itemsToFilter: MenuItem[]): MenuItem[] => {
      return itemsToFilter.reduce((acc, item) => {
        if (!checkAccess(item)) return acc;

        if (hasChildren(item)) {
          const { children, ...rest } = item;
          const filteredChildren = filterRecursively(children || []);
          // Показываем родителя, даже если детей нет (или можно скрыть, добавив проверку length > 0)
          acc.push({ ...rest, children: filteredChildren });
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as MenuItem[]);
    };

    return filterRecursively(items);
  }, [items, userRoleNames, userPosition, preloadData]);

  useEffect(() => {
    const isSharedRoute = SHARED_ROUTES.some((route) =>
      pathname.includes(route),
    );
    if (isSharedRoute) {
      sessionStorage.setItem(STORAGE_KEY, pathname);
    }
  }, [pathname]);

  const activeItem = useMemo(() => {
    const isSharedRoute = SHARED_ROUTES.some((route) =>
      pathname.includes(route),
    );

    // 1. Если мы на общем роуте (архив и т.д.), пытаемся восстановить контекст родителя
    if (isSharedRoute) {
      const lastContextKey = sessionStorage.getItem(STORAGE_KEY);
      if (lastContextKey) {
        // Ищем родителя, у которого есть ребенок с ключом lastContextKey
        // Это связывает "Архив" с тем модулем, откуда мы в него пришли
        const parent = filteredItems.find(
          (item) =>
            hasChildren(item) &&
            item.children?.some(
              (child) => String(child.key) === lastContextKey,
            ),
        );
        if (parent) return parent as TSubMenuItem;
      }
    }

    // 2. Стандартный поиск по URL (fallback)
    return filteredItems.find((item) => {
      if (!item || !("key" in item)) return false;
      const itemKey = String(item.key);
      return pathname === itemKey || pathname.startsWith(itemKey + "/");
    }) as TSubMenuItem | undefined;
  }, [pathname, filteredItems]);

  useEffect(() => {
    const isSharedRoute = SHARED_ROUTES.some((route) =>
      pathname.includes(route),
    );

    // Сохраняем ключ ТОЛЬКО если это НЕ общий роут.
    // Это запоминает "последний нормальный раздел" (например, Входящие)
    if (!isSharedRoute && activeItem && hasChildren(activeItem)) {
      // Ищем, какой именно таб активен сейчас
      const currentActiveChild = activeItem.children?.find((sub) =>
        pathname.startsWith(String(sub.key)),
      );

      if (currentActiveChild) {
        sessionStorage.setItem(STORAGE_KEY, String(currentActiveChild.key));
      }
    }
  }, [pathname, activeItem]);

  const activeKey =
    activeItem?.key ||
    (pathname.includes("modules") ? "" : AppRoutes.PROFILE_TASKS);

  const subItems = activeItem?.children;

  const handleNavigate = (path: string) => {
    let targetPath = path;

    if (path === "/modules/correspondence") {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      targetPath = saved || AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING;
    }

    if (pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const menuItems = useMemo(() => {
    if (variant === "compact" || variant === "modern") {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const contentVariants = {
    hidden: { y: 5, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className={`menu-container ${variant}-mode`}>
      {variant === "horizontal" || variant === "full" ? (
        <Menu
          onClick={(e) => handleNavigate(e.key)}
          selectedKeys={[activeKey]}
          mode="horizontal"
          items={menuItems}
          theme="light"
          disabledOverflow
          className="flex-wrap p-2 border-b-0! full-style"
        />
      ) : variant === "ios" ? (
        <IosVariant 
            items={menuItems}
            activeKey={activeKey}
            handleNavigate={handleNavigate}
            subItems={subItems}
            pathname={pathname}
        />
      ) : (
        <div className={`custom-main-menu ${variant}-style`}>
          {menuItems.map((item) => {
            if (!item || !("key" in item)) return null;
            const itemKey = String(item.key);
            const isActive = activeKey === itemKey;

            return (
              <div
                key={itemKey}
                className={`custom-menu-item ${isActive ? "selected" : ""}`}
                onClick={() => handleNavigate(itemKey)}
              >
                {isActive && (
                  <motion.div
                    layoutId="mainActiveIndicator"
                    className="main-active-indicator"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span className="custom-menu-title">
                  {"label" in item ? item.label : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <AnimatePresence mode="wait">
        {(variant === "compact" || variant === "modern") && subItems && (
          <motion.div
            key={activeKey}
            className="sub-menu-bar"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
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
                <motion.div
                  key={sub.key}
                  className={`sub-menu-item ${isActive ? "active" : ""} `}
                  onClick={() => handleNavigate(sub.key as string)}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ position: "relative" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBorder"
                      className="active-border"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      }}
                    />
                  )}
                  {variant === "modern" && "icon" in sub && (
                    <motion.span
                      variants={contentVariants}
                      className="flex items-center"
                    >
                      {sub.icon}
                    </motion.span>
                  )}
                  <motion.span variants={contentVariants}>
                    {"label" in sub ? sub.label : ""}
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
