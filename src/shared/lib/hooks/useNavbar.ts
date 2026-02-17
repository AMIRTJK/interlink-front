import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetQuery, tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { AppRoutes } from "@shared/config";
import { getModuleItems } from "./menuItems";
import { TMenuItem, TSubMenuItem, TNavbarVariant } from "./model";

const VARIANT_STORAGE_KEY = "navbar-variant";
const TAB_STORAGE_KEY = "correspondence_active_tab";
const SHARED_ROUTES = ["archive", "pinned", "trashed"];

export const useNavbar = () => {
  // --- Variant Logic ---
  const [variant, setVariantState] = useState<TNavbarVariant>(() => {
    const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
    return (stored as TNavbarVariant) || "default";
  });

  const setVariant = (newVariant: TNavbarVariant) => {
    localStorage.setItem(VARIANT_STORAGE_KEY, newVariant);
    setVariantState(newVariant);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
      if (stored) {
        setVariantState(stored as TNavbarVariant);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- Menu Logic ---
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Determine which variant to use for logic. iOS uses 'ios', default uses 'modern' (mostly).
  // The original useMenuLogic accepted a variant string. 
  // Here we derive the logic variant from the state variant.
  // If variant is 'ios', we pass 'ios'. If 'default', we pass 'modern' as per previous usage in DefaultNavbar behavior.
  const logicVariant = variant === "ios" ? "ios" : "modern";

  const items = useMemo(() => getModuleItems(logicVariant), [logicVariant]);

  const { data, preloadData } = useGetQuery({
    method: "GET",
    url: `${ApiRoutes.FETCH_USER_BY_ID}${tokenControl.getUserId()}`,
    useToken: true,
    preload: true,
  });

  const userRoleNames = useMemo(() => {
    const roles = (
      data as
        | { data: { group: string; name: string; permissions: string[] }[] }
        | undefined
    )?.data;
    const arrayRoles = Array.isArray(roles) ? roles : [];
    const namesFromRoles = arrayRoles.map((item) => item.name);
    const namesFromPreload =
      preloadData?.map((item: { name: string }) => item.name) || [];
    return [...new Set([...namesFromRoles, ...namesFromPreload])];
  }, [data, preloadData]);

  const userPosition = useMemo(() => {
    return (data as { data: { position: string } } | undefined)?.data?.position;
  }, [data]);

  const hasChildren = (item: TMenuItem): item is TSubMenuItem => {
    return item !== null && typeof item === "object" && "children" in item;
  };

  const filteredItems = useMemo(() => {
    const checkAccess = (item: TMenuItem): boolean => {
      if (!item || !("requiredRole" in item)) return true;
      const menuItem = item as TSubMenuItem;
      if (!menuItem.requiredRole?.length) return true;
      if (userPosition === "Super Administrator") return true;

      return menuItem.requiredRole.some((role: string) => userRoleNames.includes(role));
    };

    const filterRecursively = (itemsToFilter: TMenuItem[]): TMenuItem[] => {
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
      }, [] as TMenuItem[]);
    };

    return filterRecursively(items);
  }, [items, userRoleNames, userPosition]);

  const activeItem = useMemo(() => {
    const isSharedRoute = SHARED_ROUTES.some((route) =>
      pathname.includes(route),
    );

    if (isSharedRoute) {
      const lastContextKey = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (lastContextKey) {
        const parent = filteredItems.find(
          (item) =>
            hasChildren(item) &&
            item.children?.some(
              (child: TMenuItem) => String(child.key) === lastContextKey,
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

  const activeKey =
    activeItem?.key ||
    (pathname.includes("modules") ? "" : AppRoutes.PROFILE_TASKS);

  const subItems = activeItem?.children;

  const handleNavigate = (path: string) => {
    let targetPath = path;

    if (path === "/modules/correspondence") {
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
      targetPath = saved || AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING;
    }

    if (pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const menuItems = useMemo(() => {
    if (logicVariant === "modern") {
      return filteredItems.map((item) => {
        if (item && "children" in item) {
          const { children: _, ...rest } = item as TSubMenuItem;
          return rest;
        }
        return item;
      });
    }
    return filteredItems;
  }, [logicVariant, filteredItems]);

  return {
    variant,
    setVariant,
    menuItems,
    subItems,
    activeKey,
    handleNavigate,
    pathname,
  };
};
