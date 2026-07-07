import React from "react";
import { THEMES } from "@widgets/layout/ui/designSettings";

export const useCalendarTheme = () => {
  const [themeKey, setThemeKey] = React.useState(
    () => localStorage.getItem("currentTheme") || "emerald"
  );

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "currentTheme" && e.newValue) {
        setThemeKey(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const theme = THEMES[themeKey] || THEMES.emerald;

  return { themeKey, theme };
};
