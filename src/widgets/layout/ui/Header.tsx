import { Link } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { Logo } from "@shared/ui";
import { ModuleMenu } from "./ModuleMenu";
import { AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DesktopMode } from "../../../features/Profile/ui/DesktopMode";
import { IProps } from "./header/headerModel";
import { HeaderUserBadge } from "./header/HeaderUserBadge";
import { HeaderActionButtons } from "./header/HeaderActionButtons";
import { useHeaderState } from "./header/useHeaderState";

export const Header = ({
  currentTheme,
  setCurrentTheme,
  currentBg,
  setCurrentBg,
  layoutMode = "top",
  setLayoutMode,
}: IProps) => {
  const {
    handleLogout,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isDesktopActive,
    setIsDesktopActive,
    notifOpen,
    setNotifOpen,
    unreadCount,
    isDarkMode,
    toggleTheme,
    userData,
    userName,
    userSubtitle,
  } = useHeaderState();

  const showLogo = layoutMode === "top" || layoutMode === "bottom";
  const showModuleNav = layoutMode === "top";
  const isFullWidth = layoutMode === "top" || layoutMode === "bottom";

  return (
    <header
      className={`ui-glass sticky top-0 z-50 flex items-center justify-between gap-4 bg-white/40 dark:bg-slate-800/80 backdrop-blur-3xl px-6 py-4 shadow-lg transition-all duration-300 ease-in-out ${
        isFullWidth
          ? "w-[calc(100%+48px)] -mx-6 -mt-4 rounded-none border-b border-white/20 dark:border-slate-700/60"
          : "w-full rounded-[2.5rem] border border-white/20 dark:border-slate-700/60"
      }`}
    >
      <div className="flex-1 flex items-center gap-6 min-w-0">
        {showLogo && (
          <Link
            to={AppRoutes.PROFILE}
            aria-label="На главную"
            className="flex items-center gap-3 focus:outline-none rounded-lg shrink-0"
          >
            <Logo className="text-base sm:text-lg md:text-xl text-zinc-900 dark:text-white" />
          </Link>
        )}

        <HeaderUserBadge
          userData={userData}
          userName={userName}
          userSubtitle={userSubtitle}
          showLogo={showLogo}
        />
      </div>

      {showModuleNav && (
        <div className="flex items-center justify-center shrink-0">
          <ModuleMenu variant="header" navLayout="top" />
        </div>
      )}

      <div className="flex-1 flex items-center justify-end shrink-0">
        <HeaderActionButtons
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          unreadCount={unreadCount}
          setIsDesktopActive={setIsDesktopActive}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          currentBg={currentBg}
          setCurrentBg={setCurrentBg}
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          setShowLogoutConfirm={setShowLogoutConfirm}
        />
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <AnimatePresence>
        {isDesktopActive && (
          <DesktopMode
            userData={userData}
            onClose={() => setIsDesktopActive(false)}
            isDark={isDarkMode}
          />
        )}
      </AnimatePresence>
    </header>
  );
};
