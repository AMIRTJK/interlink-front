import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { THEMES, BACKGROUNDS, LayoutMode } from "./designSettings";
import { tokenControl } from "@shared/lib";

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
      return tokenControl.getDarkMode();
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

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-br ${bgClass} ${
        isDarkMode ? "text-white" : "text-zinc-900"
      } transition-all duration-300`}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden pointer-events-none"
      >
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${themeGradient} opacity-[0.08] blur-[100px] rounded-full`} />
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br ${themeGradient} opacity-[0.06] blur-[120px] rounded-full`} />
        <div className={`absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr ${themeGradient} opacity-[0.05] blur-[110px] rounded-full`} />
      </div>

      <div className="relative z-10 flex gap-6 px-6 py-4 min-h-screen transition-all duration-300 ease-in-out">
        {layoutMode === "left" && (
          <Sidebar
            side="left"
            setLayoutMode={setLayoutMode}
            themeGradient={themeGradient}
          />
        )}

        <div
          className="flex-1 min-w-0 flex flex-col gap-6 transition-all duration-300 ease-in-out"
          style={layoutMode === "bottom" ? { paddingBottom: 56 } : undefined}
        >
          <Header
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            currentBg={currentBg}
            setCurrentBg={setCurrentBg}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />
          <main className="flex-1 pb-10 overflow-x-hidden">
            <Outlet context={{ currentTheme }} />
          </main>
        </div>

        {layoutMode === "right" && (
          <Sidebar
            side="right"
            setLayoutMode={setLayoutMode}
            themeGradient={themeGradient}
          />
        )}
      </div>

      {layoutMode === "bottom" && <BottomNav />}
    </div>
  );
};
