import { Outlet } from "react-router-dom";
import { ModuleMenu } from "./ModuleMenu";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useCorrespondenceRoute } from "@shared/lib";
import { Navbar } from "@widgets/Navbar";
import { useNavbar, useTabs } from "@shared/lib/hooks";
import { useLayoutMode, useMoveHeader } from "./useLayoutMode";
import { useDesignSettings } from "./useDesignSettings";
import { THEMES, BACKGROUNDS } from "./designSettings";
import { If } from "@shared/ui";

export const MainLayout = () => {
  const { shouldHideUI } = useCorrespondenceRoute();
  const { variant } = useNavbar();
  const { tabMode } = useTabs();
  const [layoutMode, setLayoutMode] = useLayoutMode();
  const [moveHeader] = useMoveHeader();
  const { currentTheme, setCurrentTheme, currentBg, setCurrentBg, isDarkMode } =
    useDesignSettings();

  const activeTheme = THEMES[currentTheme] || THEMES.emerald;
  const activeBg = BACKGROUNDS[currentBg] || BACKGROUNDS.arctic;
  const themeGradient = activeTheme.gradient;
  const bgClass = isDarkMode ? activeBg.dark : activeBg.light;

  // Детальные экраны корреспонденции скрывают всю навигацию — раскладку не применяем.
  if (shouldHideUI) {
    return (
      <div
        className={`min-h-screen flex flex-col bg-gradient-to-br ${bgClass} ${
          isDarkMode ? "text-white" : "text-zinc-900"
        } transition-all duration-300`}
      >
        <div className="flex-grow flex flex-col min-w-0">
          <main className="flex-grow min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // iOS-навбар — самостоятельная раскладка, боковое/нижнее меню к нему не применяем.
  const effectiveLayout = variant === "ios" ? "top" : layoutMode;
  const hideHeader = moveHeader && effectiveLayout !== "top";

  const showSidebarLeft = effectiveLayout === "left";
  const showSidebarRight = effectiveLayout === "right";
  const showBottomNav = effectiveLayout === "bottom";

  return (
    <div
      className={`relative min-h-screen flex flex-col bg-gradient-to-br ${bgClass} ${
        isDarkMode ? "text-white" : "text-zinc-900"
      } transition-all duration-300`}
    >
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${themeGradient} opacity-[0.08] blur-[100px] rounded-full`} />
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br ${themeGradient} opacity-[0.06] blur-[120px] rounded-full`} />
        <div className={`absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr ${themeGradient} opacity-[0.05] blur-[110px] rounded-full`} />
      </div>

      <div className="relative z-10 flex flex-grow gap-6 px-6 py-4 transition-all duration-300 ease-in-out min-w-0">
        {showSidebarLeft && (
          <Sidebar side="left" setLayoutMode={setLayoutMode} themeGradient={themeGradient} />
        )}

        <div
          className="flex-1 min-w-0 flex flex-col gap-6 transition-all duration-300 ease-in-out"
          style={showBottomNav ? { paddingBottom: 56 } : undefined}
        >
          <If is={!hideHeader}>
            <Header
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              currentBg={currentBg}
              setCurrentBg={setCurrentBg}
              layoutMode={effectiveLayout}
              setLayoutMode={setLayoutMode}
            />
          </If>
          {variant === "ios" ? (
            <Navbar />
          ) : (
            <ModuleMenu variant="modern" hideTopLevel />
          )}
          <main
            className={`flex-grow min-w-0 ${
              variant === "ios" || tabMode === "on" ? "pb-30" : ""
            }`}
          >
            <Outlet />
          </main>
        </div>

        {showSidebarRight && (
          <Sidebar side="right" setLayoutMode={setLayoutMode} themeGradient={themeGradient} />
        )}
      </div>

      {showBottomNav && <BottomNav />}
    </div>
  );
};
