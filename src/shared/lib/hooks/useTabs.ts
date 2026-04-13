import { useState, useCallback, useEffect } from "react";
import { ITab, TTabMode } from "./model";
import { useNavigate } from "react-router-dom";

const TABS_STORAGE_KEY = "navigation-tabs";
const TABS_MODE_STORAGE_KEY = "navigation-tabs-mode";

export const useTabs = () => {
  const navigate = useNavigate();

  const [tabMode, setTabModeState] = useState<TTabMode>(() => {
    return (localStorage.getItem(TABS_MODE_STORAGE_KEY) as TTabMode) || "off";
  });

  // Инициализация массива вкладок
  const [tabs, setTabsState] = useState<ITab[]>(() => {
    try {
      const stored = localStorage.getItem(TABS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isTabsCollapsed, setIsTabsCollapsedState] = useState<boolean>(() => {
    return localStorage.getItem("navigation-tabs-collapsed") === "true";
  });

  useEffect(() => {
    const handleUpdate = () => {
      const mode = localStorage.getItem(TABS_MODE_STORAGE_KEY) as TTabMode | null;
      if (mode) setTabModeState(mode);

      const collapsed = localStorage.getItem("navigation-tabs-collapsed") === "true";
      setIsTabsCollapsedState(collapsed);
      const stored = localStorage.getItem(TABS_STORAGE_KEY);
      if (stored) {
        try {
          setTabsState(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse tabs", e);
        }

      } else {
        setTabsState([]);
      }
    };

    window.addEventListener("tabs-update", handleUpdate);
    // Для других окон/вкладок браузера
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("tabs-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setTabMode = useCallback((mode: TTabMode) => {
    localStorage.setItem(TABS_MODE_STORAGE_KEY, mode);
    setTabModeState(mode);
    window.dispatchEvent(new Event("tabs-update"));
  }, []);

  const addTab = useCallback((newTab: ITab) => {
      setTabsState((prev) => {
        const cleanedPrev = prev.map(t =>
          (typeof t.label === "string" && t.label.includes("[object Object]"))
            ? { ...t, label: "Раздел" }
            : t
        );

        const existingIndex = cleanedPrev.findIndex((tab) => tab.key === newTab.key);
        
        if (existingIndex >= 0) {
          const current = cleanedPrev[existingIndex];
          if (newTab.label && current.label !== newTab.label && !newTab.label.includes("[object Object]")) {
            const updated = [...cleanedPrev];
            updated[existingIndex] = { ...current, label: newTab.label };
            localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(updated, (k, v) => k === 'icon' ? undefined : v));
            window.dispatchEvent(new Event("tabs-update"));
            return updated;
          }
          return cleanedPrev;
        }

        if (cleanedPrev.length >= 4) {
          return cleanedPrev;
        }

        const newTabs = [...cleanedPrev, newTab];
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(newTabs, (k, v) => k === 'icon' ? undefined : v));
        window.dispatchEvent(new Event("tabs-update"));
        return newTabs;
      });
    },
    []
  );

  const removeTab = useCallback(
    (key: string, currentPathInfo?: { pathname: string, activeKey?: string }) => {
      setTabsState((prev) => {
        const newTabs = prev.filter((tab) => tab.key !== key);
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(newTabs, (k, v) => k === 'icon' ? undefined : v));
        window.dispatchEvent(new Event("tabs-update"));

        if (
          currentPathInfo && 
          (currentPathInfo.pathname === key || currentPathInfo.pathname.startsWith(key + "/") || currentPathInfo.activeKey === key)
        ) {
          if (newTabs.length > 0) {
            navigate(newTabs[newTabs.length - 1].path);
          } else {
            navigate("/");
          }
        }

        return newTabs;
      });
    },
    [navigate]
  );

  const setIsTabsCollapsed = useCallback((collapsed: boolean) => {
    localStorage.setItem("navigation-tabs-collapsed", String(collapsed));
    setIsTabsCollapsedState(collapsed);
    window.dispatchEvent(new Event("tabs-update"));
  }, []);

  return {
    tabs,
    tabMode,
    setTabMode,
    addTab,
    removeTab,
    isTabsCollapsed,
    setIsTabsCollapsed,
  };
};
