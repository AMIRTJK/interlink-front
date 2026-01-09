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

  const [isSnowEnabled, setIsSnowEnabled] = useState(() => {
    return localStorage.getItem("snow-enabled") === "true";
  });

  const [isRainEnabled, setIsRainEnabled] = useState(() => {
    return localStorage.getItem("rain-enabled") === "true";
  });

  const [isAutumnEnabled, setIsAutumnEnabled] = useState(() => {
    return localStorage.getItem("autumn-enabled") === "true";
  });

  const [isSakuraEnabled, setIsSakuraEnabled] = useState(() => {
    return localStorage.getItem("sakura-enabled") === "true";
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

  useEffect(() => {
    localStorage.setItem("snow-enabled", String(isSnowEnabled));
  }, [isSnowEnabled]);

  useEffect(() => {
    localStorage.setItem("rain-enabled", String(isRainEnabled));
  }, [isRainEnabled]);

  useEffect(() => {
    localStorage.setItem("autumn-enabled", String(isAutumnEnabled));
  }, [isAutumnEnabled]);

  useEffect(() => {
    localStorage.setItem("sakura-enabled", String(isSakuraEnabled));
  }, [isSakuraEnabled]);


  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      isAnimEnabled,
      setIsAnimEnabled,
      isSnowEnabled,
      setIsSnowEnabled,
      isRainEnabled,
      setIsRainEnabled,
      isAutumnEnabled,
      setIsAutumnEnabled,
      isSakuraEnabled,
      setIsSakuraEnabled
    }}>
      <ConfigProvider theme={{ token: { motion: isAnimEnabled } }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
