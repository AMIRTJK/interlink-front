import { createContext, useEffect, useState, type ReactNode } from "react";
import { ConfigProvider } from "antd";
import { Theme, ThemeContextType } from "./theme.types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as Theme) || "light";
  });

  const [isAnimEnabled, setIsAnimEnabled] = useState(() => {
    return localStorage.getItem("anim-enabled") !== "false";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "space");
    root.classList.add(theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("anim-enabled", String(isAnimEnabled));
    if (!isAnimEnabled) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }
  }, [isAnimEnabled]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isAnimEnabled, setIsAnimEnabled }}>
      <ConfigProvider theme={{ token: { motion: isAnimEnabled } }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
