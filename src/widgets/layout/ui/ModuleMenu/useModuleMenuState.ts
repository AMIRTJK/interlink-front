import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { ApiRoutes } from "@shared/api";
import { tokenControl, useGetQuery } from "@shared/lib";
import { getModuleItems, MenuItem } from "./lib";
import { SHARED_ROUTES, STORAGE_KEY, TSubMenuItem } from "./moduleMenuModel";

export const useModuleMenuState = (variant: string) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = useMemo(() => getModuleItems(variant as any), [variant]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved && !String(saved).startsWith("/modules/correspondence")) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const { data, preloadData } = useGetQuery({
    method: "GET",
    url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
    useToken: true,
    preload: true,
    options: { refetchOnWindowFocus: false, staleTime: Infinity },
  });

  const userRolesArray = useMemo(() => {
    const roles = (
      data as
        | { data: { group: string; name: string; permissions: string[] }[] }
        | undefined
    )?.data;
    return Array.isArray(roles) ? roles : [];
  }, [data]);

  const userRoleNames = useMemo(() => {
    const namesFromRoles = userRolesArray.map((item) => item.name);
    const namesFromPreload =
      preloadData?.map((item: { name: string }) => item.name) || [];
    return [...new Set([...namesFromRoles, ...namesFromPreload])];
  }, [userRolesArray, preloadData]);

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

    if (isSharedRoute) {
      const lastContextKey = sessionStorage.getItem(STORAGE_KEY);
      if (lastContextKey) {
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

    if (!isSharedRoute && activeItem && hasChildren(activeItem)) {
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
    (pathname.includes("modules") ? "" : AppRoutes.PROFILE);

  const subItems = activeItem?.children;

  const handleNavigate = (path: string) => {
    let targetPath = path;

    if (path === "/modules/correspondence") {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved && String(saved).startsWith("/modules/correspondence")) {
        targetPath = String(saved);
      } else {
        targetPath = AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING;
      }
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

  return {
    pathname,
    menuItems,
    activeKey,
    subItems,
    handleNavigate,
  };
};
