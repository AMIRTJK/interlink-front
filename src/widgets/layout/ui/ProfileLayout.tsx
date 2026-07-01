import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { THEMES, BACKGROUNDS, LayoutMode } from "./designSettings";

export const ProfileLayout = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentTheme") || "emerald";
    }
    return "emerald";
  });

  const [currentBg, setCurrentBg] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentBg") || "arctic";
    }
    return "arctic";
  });

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("layoutMode");
      if (saved === "top" || saved === "left" || saved === "bottom" || saved === "right") {
        return saved;
      }
    }
    return "top";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const activeTheme = THEMES[currentTheme] || THEMES.emerald;
  const activeBg = BACKGROUNDS[currentBg] || BACKGROUNDS.arctic;
  const themeGradient = activeTheme.gradient;
  const bgClass = isDarkMode ? activeBg.dark : activeBg.light;
  const isVertical = layoutMode === "left" || layoutMode === "right";

  return (
    <div className={`relative min-h-screen bg-gradient-to-br ${bgClass} transition-all duration-300`}>
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden pointer-events-none"
      >
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${themeGradient} opacity-[0.08] blur-[100px] rounded-full`} />
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br ${themeGradient} opacity-[0.06] blur-[120px] rounded-full`} />
        <div className={`absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr ${themeGradient} opacity-[0.05] blur-[110px] rounded-full`} />
      </div>

      <div
        className={`relative z-10 flex min-h-screen ${
          layoutMode === "bottom"
            ? "flex-col-reverse"
            : layoutMode === "left"
              ? "flex-row"
              : layoutMode === "right"
                ? "flex-row-reverse"
                : "flex-col"
        }`}
      >
        {isVertical ? (
          <Header
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            currentBg={currentBg}
            setCurrentBg={setCurrentBg}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />
        ) : (
          <div>
            <Header
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              currentBg={currentBg}
              setCurrentBg={setCurrentBg}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
            />
          </div>
        )}
        <main className="pb-10 flex-1 overflow-x-hidden">
          <div className="w-full px-6 pt-6">
            <Outlet context={{ currentTheme }} />
          </div>
        </main>
      </div>
    </div>
  );
};
