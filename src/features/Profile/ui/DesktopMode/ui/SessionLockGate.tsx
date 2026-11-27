import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useIsDarkMode, useLogout } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import { DesktopMode } from "../ui";
import { LOCK_TEXTS } from "../lockModel";
import { CONTROLS_FADE_TRANSITION, LOCK_TOOLTIP_Z_INDEX } from "../model";
import { useSessionLock } from "../api/useSessionLock";
import { useLockUser } from "../api/useLockUser";
import { useInertBackground } from "../lib/useInertBackground";
import { useLockPageScroll } from "../lib/useLockPageScroll";
import { UnlockForm } from "./UnlockForm";

/**
 * Единственная точка монтирования экрана блокировки (app/routes/PrivateRoute),
 * а не кнопки раскладок: флаг читается из хранилища при каждой загрузке, и
 * блокировка не зависит от того, какая раскладка (или её отсутствие) на экране.
 * Закрыть экран можно только паролем или выходом из системы — Esc и клик мимо
 * ничего не делают.
 */
export const SessionLockGate = () => {
  const { isLocked, unlock } = useSessionLock();
  const userData = useLockUser();
  const isDark = useIsDarkMode();
  const handleLogout = useLogout();

  useInertBackground(isLocked);
  useLockPageScroll(isLocked);

  return (
    <AnimatePresence>
      {isLocked && (
        <DesktopMode
          userData={userData}
          isDark={isDark}
          headerAction={(isSceneDark, isControlsVisible) => (
            <Tooltip
              title={LOCK_TEXTS.logout}
              placement="bottomRight"
              zIndex={LOCK_TOOLTIP_Z_INDEX}
              open={isControlsVisible ? undefined : false}
            >
              <motion.button
                type="button"
                onClick={handleLogout}
                aria-label={LOCK_TEXTS.logout}
                initial={false}
                animate={{ opacity: isControlsVisible ? 1 : 0 }}
                transition={isControlsVisible ? CONTROLS_FADE_TRANSITION.show : CONTROLS_FADE_TRANSITION.hide}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 backdrop-blur-xl border cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-400 ${isControlsVisible ? "" : "pointer-events-none"} ${isSceneDark ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-800"}`}
              >
                <LogOut size={18} />
              </motion.button>
            </Tooltip>
          )}
        >
          {(isSceneDark) => <UnlockForm isDark={isSceneDark} onUnlock={unlock} />}
        </DesktopMode>
      )}
    </AnimatePresence>
  );
};
